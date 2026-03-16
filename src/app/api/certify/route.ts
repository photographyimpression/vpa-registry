import { NextRequest, NextResponse } from 'next/server';
import { applyWatermark } from '@/app/api/watermark/route';
import { auth } from '@/auth';
import sharp from 'sharp';
import { Ratelimit } from '@upstash/ratelimit';
import { redis, requireRedis } from '@/lib/redis';
import { invalidateCertificateCache } from '@/lib/data';

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB (reduced from 50 MB for memory safety)
const N8N_TIMEOUT_MS = 15_000;
const N8N_MAX_RETRIES = 3;
const N8N_RETRY_BASE_MS = 1_000; // exponential backoff: 1s, 2s, 4s

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Uses Upstash Redis (required in production for multi-instance safety).
// Falls back to an in-process Map ONLY in development.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

const upstashRatelimit = redis
    ? new Ratelimit({
          redis,
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
    // In-process fallback — dev only. requireRedis() will throw in production.
    requireRedis();
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

// ── Idempotency ─────────────────────────────────────────────────────────────
// Prevents duplicate certificates from retries or double-clicks.
// Uses Redis SET NX with 5-min TTL. Falls back to in-memory Set in dev.
const IDEMPOTENCY_TTL_S = 300;
const localIdempotencySet = new Set<string>();

async function checkIdempotency(key: string): Promise<boolean> {
    if (!key) return true; // no key provided — allow
    if (redis) {
        const wasSet = await redis.set(`vpa:idem:${key}`, '1', { nx: true, ex: IDEMPOTENCY_TTL_S });
        return wasSet !== null; // null means key already existed
    }
    if (localIdempotencySet.has(key)) return false;
    localIdempotencySet.add(key);
    setTimeout(() => localIdempotencySet.delete(key), IDEMPOTENCY_TTL_S * 1000);
    return true;
}

// ── AI-generated image detection ─────────────────────────────────────────────
type AiDetectionMode = 'off' | 'warn' | 'reject';

export async function checkForAiGenerated(buf: Buffer, mimeType: string): Promise<string | null> {
    const mode = (process.env.AI_DETECTION_MODE ?? 'off') as AiDetectionMode;
    if (mode === 'off') return null;
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

// ── n8n webhook with retry ───────────────────────────────────────────────────
async function callN8nWithRetry(
    webhookUrl: string,
    payload: Record<string, unknown>,
): Promise<{ ok: boolean; certifiedImageUrl: string }> {
    for (let attempt = 0; attempt < N8N_MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(N8N_TIMEOUT_MS),
            });

            if (res.ok) {
                const body = await res.text();
                let certifiedImageUrl = '';
                if (body) {
                    try {
                        certifiedImageUrl = JSON.parse(body).certifiedImageUrl || '';
                    } catch {
                        console.warn('[VPA Certify] n8n returned non-JSON response');
                    }
                }
                return { ok: true, certifiedImageUrl };
            }

            console.warn(`[VPA Certify] n8n returned ${res.status} (attempt ${attempt + 1}/${N8N_MAX_RETRIES})`);
        } catch (err) {
            console.error(`[VPA Certify] n8n webhook error (attempt ${attempt + 1}/${N8N_MAX_RETRIES}):`, err);
        }

        // Exponential backoff before retry (skip on last attempt)
        if (attempt < N8N_MAX_RETRIES - 1) {
            const delay = N8N_RETRY_BASE_MS * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return { ok: false, certifiedImageUrl: '' };
}

/**
 * POST /api/certify
 *
 * Accepts multipart/form-data with:
 *   - image: File (max 20 MB)
 *   - productName: string
 *   - batchId: string
 *   - idempotencyKey?: string (optional, prevents duplicate certs)
 *
 * Returns JSON:
 *   { vpaId, certifiedImageBase64, registryUrl, certifiedImageUrl? }
 */
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
        const manufacturerName = (formData.get('manufacturerName') as string) || session.user.name || session.user.email || 'Unknown Manufacturer';
        const deviceMetadata = (formData.get('deviceMetadata') as string) || batchId;
        const idempotencyKey = (formData.get('idempotencyKey') as string) || '';

        // Idempotency check
        if (idempotencyKey && !await checkIdempotency(idempotencyKey)) {
            return NextResponse.json(
                { error: 'Duplicate request — this image has already been submitted. Please wait a moment.' },
                { status: 409 }
            );
        }

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: 'File too large. Maximum allowed size is 20 MB.' },
                { status: 400 }
            );
        }

        const rawBuffer = Buffer.from(await file.arrayBuffer());

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

        // ── 3. Call n8n webhook with retry (async record-keeping) ────────────
        let certifiedImageUrl = '';
        const webhookUrl = process.env.N8N_CERTIFICATION_WEBHOOK_URL;

        if (webhookUrl) {
            const result = await callN8nWithRetry(webhookUrl, {
                vpaId,
                productName,
                manufacturerName,
                deviceMetadata,
                batchId,
                issueDate,
                fileName: file.name,
                registryUrl,
                certifiedImageBase64,
            });

            certifiedImageUrl = result.certifiedImageUrl;

            if (!result.ok) {
                console.error(`[VPA Certify] n8n webhook FAILED after ${N8N_MAX_RETRIES} retries for ${vpaId}. Certificate was issued but may not be persisted.`);
            }
        } else {
            console.warn('[VPA Certify] N8N_CERTIFICATION_WEBHOOK_URL not set — certificate will not be persisted to Google Sheets.');
        }

        // ── 4. Invalidate cache so next read picks up the new cert ──────────
        await invalidateCertificateCache();

        // ── 5. Return result to frontend ────────────────────────────────────
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
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const num = String(Math.floor(1000 + Math.random() * 9000));
    return `VPA-${part}-${num}`;
}
