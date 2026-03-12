import { NextRequest, NextResponse } from 'next/server';
import { applyWatermark } from '@/app/api/watermark/route';
import { auth } from '@/auth';
import sharp from 'sharp';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const N8N_TIMEOUT_MS = 15_000; // 15 s — don't hang the request if n8n is slow

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are
// set (multi-instance safe). Falls back to an in-process Map for single-instance
// dev / environments without Redis configured.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

const upstashRatelimit =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Ratelimit({
              redis: new Redis({
                  url: process.env.UPSTASH_REDIS_REST_URL,
                  token: process.env.UPSTASH_REDIS_REST_TOKEN,
              }),
              limiter: Ratelimit.slidingWindow(RATE_LIMIT, '60 s'),
              analytics: false,
              prefix: 'vpa:rl',
          })
        : null;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(userId: string): Promise<boolean> {
    if (upstashRatelimit) {
        const { success } = await upstashRatelimit.limit(userId);
        return success;
    }
    // In-process fallback
    const now = Date.now();
    const record = rateLimitMap.get(userId);
    if (!record || now >= record.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }
    if (record.count >= RATE_LIMIT) return false;
    record.count++;
    return true;
}

// ── AI-generated image detection ─────────────────────────────────────────────
// Uses EXIF metadata as a heuristic: real camera JPEGs always carry EXIF with
// make/model; AI-generated images typically have no EXIF at all.
// Controlled by AI_DETECTION_MODE env var: off (default) | warn | reject
type AiDetectionMode = 'off' | 'warn' | 'reject';

export async function checkForAiGenerated(buf: Buffer, mimeType: string): Promise<string | null> {
    // Read env var at call-time so it picks up runtime overrides (test env, hot config)
    const mode = (process.env.AI_DETECTION_MODE ?? 'off') as AiDetectionMode;
    if (mode === 'off') return null;
    // Only JPEG and TIFF reliably carry camera EXIF — skip PNG/WebP
    if (mimeType !== 'image/jpeg' && mimeType !== 'image/tiff') return null;
    const meta = await sharp(buf).metadata();
    if (!meta.exif || meta.exif.length < 12) {
        return 'Image lacks camera EXIF metadata — possible AI-generated image';
    }
    return null;
}

// ── Magic-bytes image type detection ─────────────────────────────────────────
export function detectImageMagicBytes(buf: Buffer): string | null {
    if (buf.length < 12) return null;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
    if (
        buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
        buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
    ) return 'image/webp';
    if (
        (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a && buf[3] === 0x00) ||
        (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0x00 && buf[3] === 0x2a)
    ) return 'image/tiff';
    return null;
}

/**
 * POST /api/certify
 *
 * Accepts multipart/form-data with:
 *   - image: File
 *   - productName: string
 *   - batchId: string
 *
 * Returns JSON:
 *   { vpaId, certifiedImageBase64, registryUrl, certifiedImageUrl? }
 */
export async function POST(req: NextRequest) {
    // Auth guard — only authenticated partners may issue certificates
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting
    const userId = session.user.email ?? session.user.name ?? 'unknown';
    if (!await checkRateLimit(userId)) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment before trying again.' },
            { status: 429 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const productName = (formData.get('productName') as string) || 'Unknown Product';
        const batchId = (formData.get('batchId') as string) || 'N/A';

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: 'File too large. Maximum allowed size is 50 MB.' },
                { status: 400 }
            );
        }

        // Read buffer for magic-byte validation
        const rawBuffer = Buffer.from(await file.arrayBuffer());

        // MIME type: check declared type AND actual magic bytes
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}. Accepted: JPEG, PNG, WebP, TIFF` },
                { status: 400 }
            );
        }
        const detectedType = detectImageMagicBytes(rawBuffer);
        if (!detectedType) {
            return NextResponse.json(
                { error: 'File content does not match a valid image format.' },
                { status: 400 }
            );
        }

        // ── AI image detection ──────────────────────────────────────────────
        const aiReason = await checkForAiGenerated(rawBuffer, detectedType);
        if (aiReason) {
            if ((process.env.AI_DETECTION_MODE ?? 'off') === 'reject') {
                return NextResponse.json({ error: aiReason }, { status: 422 });
            }
            console.warn(`[VPA Certify] AI detection warning (${userId}): ${aiReason}`);
        }

        // ── 1. Generate VPA ID ──────────────────────────────────────────────
        const vpaId = generateVpaId();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
        const registryUrl = `${appUrl}/id/${vpaId}`;
        const issueDate = new Date().toISOString().split('T')[0];

        // ── 2. Watermark the image ──────────────────────────────────────────
        const watermarkedBuffer = await applyWatermark(rawBuffer, vpaId);
        const certifiedImageBase64 = watermarkedBuffer.toString('base64');

        // ── 3. Call n8n webhook (async record-keeping) ──────────────────────
        let certifiedImageUrl = '';
        const webhookUrl = process.env.N8N_CERTIFICATION_WEBHOOK_URL;

        if (webhookUrl) {
            try {
                const n8nRes = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vpaId,
                        productName,
                        batchId,
                        issueDate,
                        fileName: file.name,
                        registryUrl,
                        // Send watermarked image as base64 for n8n to store
                        certifiedImageBase64,
                    }),
                    signal: AbortSignal.timeout(N8N_TIMEOUT_MS),
                });

                if (n8nRes.ok) {
                    const body = await n8nRes.text();
                    if (body) {
                        try {
                            certifiedImageUrl = JSON.parse(body).certifiedImageUrl || '';
                        } catch {
                            console.warn('[VPA Certify] n8n returned non-JSON response');
                        }
                    }
                } else {
                    console.warn(`[VPA Certify] n8n returned ${n8nRes.status} — proceeding without storage URL`);
                }
            } catch (n8nErr) {
                // Don't fail the whole request if n8n is unreachable
                console.error('[VPA Certify] n8n webhook error (non-fatal):', n8nErr);
            }
        } else {
            console.warn('[VPA Certify] N8N_CERTIFICATION_WEBHOOK_URL not set — certificate will not be persisted to Google Sheets.');
        }

        // ── 4. Return result to frontend ────────────────────────────────────
        return NextResponse.json({
            vpaId,
            registryUrl,
            certifiedImageUrl,
            certifiedImageBase64,
            issueDate,
            productName,
        });
    } catch (error) {
        console.error('[VPA Certify] Error:', error);
        return NextResponse.json({ error: 'Certification failed. Please try again.' }, { status: 500 });
    }
}

function generateVpaId(): string {
    // Use only unambiguous characters (no 0/O, 1/I/L)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const num = String(Math.floor(1000 + Math.random() * 9000));
    return `VPA-${part}-${num}`;
}
