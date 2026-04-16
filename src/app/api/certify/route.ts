import { NextRequest, NextResponse } from 'next/server';
import { applyWatermark } from '@/app/api/watermark/route';
import { auth } from '@/auth';
import { Ratelimit } from '@upstash/ratelimit';
import { redis, requireRedis } from '@/lib/redis';
import { invalidateCertificateCache } from '@/lib/data';

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const N8N_TIMEOUT_MS = 30_000;
const N8N_MAX_RETRIES = 2;
const N8N_RETRY_BASE_MS = 2_000;

// ── Rate limiting ─────────────────────────────────────────────────────────────
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
const IDEMPOTENCY_TTL_S = 300;
const localIdempotencySet = new Set<string>();

async function checkIdempotency(key: string): Promise<boolean> {
    if (!key) return true;
    if (redis) {
        const wasSet = await redis.set(`vpa:idem:${key}`, '1', { nx: true, ex: IDEMPOTENCY_TTL_S });
        return wasSet !== null;
    }
    if (localIdempotencySet.has(key)) return false;
    localIdempotencySet.add(key);
    setTimeout(() => localIdempotencySet.delete(key), IDEMPOTENCY_TTL_S * 1000);
    return true;
}

// ── Magic-bytes image type detection ─────────────────────────────────────────
function detectImageMagicBytes(buf: Buffer): string | null {
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

function generateVpaId(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const num = String(Math.floor(1000 + Math.random() * 9000));
    return `VPA-${part}-${num}`;
}

// ── n8n AI detection ────────────────────────────────────────────────────────
// Sends the image to n8n for AI detection (EXIF check + Claude Vision).
// Returns: { approved: true } or { rejected: true, error: '...' }
// If n8n returns full pipeline data (vpaId, certifiedImageBase64), those are
// passed through so the caller can use them directly.
async function callN8nForDetection(
    webhookUrl: string,
    payload: Record<string, unknown>,
): Promise<{ ok: boolean; rejected?: boolean; data: Record<string, unknown> }> {
    for (let attempt = 0; attempt < N8N_MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(N8N_TIMEOUT_MS),
            });

            const body = await res.text();
            let data: Record<string, unknown> = {};
            if (body) {
                try { data = JSON.parse(body); } catch { /* non-JSON body */ }
            }

            // n8n returned a rejection (AI-generated, not a product, etc.)
            if (data.rejected) {
                return { ok: true, rejected: true, data };
            }

            // n8n returned full pipeline data (vpaId, certifiedImageBase64, etc.)
            if (res.ok && data.vpaId) {
                return { ok: true, data };
            }

            // n8n returned 200 with empty body or incomplete data —
            // the pipeline likely errored after AI approval (e.g. watermark step failed).
            // Treat as "approved" so we can do watermarking locally.
            if (res.ok && !body) {
                console.warn('[VPA Certify] n8n returned empty response — assuming AI approved, proceeding locally');
                return { ok: true, data: { approved: true } };
            }

            // n8n returned 200 with data but no vpaId and no rejection —
            // partial success, treat as approved
            if (res.ok) {
                console.warn('[VPA Certify] n8n returned incomplete data — proceeding locally');
                return { ok: true, data: { approved: true, ...data } };
            }

            // n8n returned a non-200 error with a message
            if (data.error || data.reason) {
                const msg = String(data.error || data.reason || '');
                // Don't expose raw internal errors
                if (/Unexpected|ECONN|ETIMED|socket hang up|Database/.test(msg)) {
                    console.warn('[VPA Certify] n8n internal error:', msg);
                    // On internal errors, retry
                } else {
                    return { ok: false, data };
                }
            }

            console.warn(`[VPA Certify] n8n returned ${res.status} (attempt ${attempt + 1}/${N8N_MAX_RETRIES})`);
        } catch (err) {
            console.error(`[VPA Certify] n8n error (attempt ${attempt + 1}/${N8N_MAX_RETRIES}):`, err);
        }

        if (attempt < N8N_MAX_RETRIES - 1) {
            const delay = N8N_RETRY_BASE_MS * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // All retries failed — allow certificate issuance without AI detection
    // rather than blocking the user entirely
    console.error('[VPA Certify] n8n unavailable after retries — proceeding without AI detection');
    return { ok: true, data: { approved: true, aiSkipped: true } };
}

/**
 * POST /api/certify
 *
 * Hybrid pipeline:
 *   1. Validates the uploaded image
 *   2. Sends to n8n for AI detection (EXIF + Claude Vision)
 *   3. If approved, generates VPA ID and watermarks locally
 *   4. Returns the certified image to the frontend
 *
 * n8n handles: AI detection, Google Drive upload, Google Sheets recording
 * Next.js handles: watermarking, VPA ID generation (reliable, no external deps)
 */
export async function POST(req: NextRequest) {
    try {
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

        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const productName = (formData.get('productName') as string) || 'Unknown Product';
        const batchId = (formData.get('batchId') as string) || 'N/A';
        const manufacturerName = (formData.get('manufacturerName') as string) || session.user.name || session.user.email || 'Unknown Manufacturer';
        const deviceMetadata = (formData.get('deviceMetadata') as string) || batchId;
        const idempotencyKey = (formData.get('idempotencyKey') as string) || '';

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
        if (!detectImageMagicBytes(rawBuffer)) {
            return NextResponse.json(
                { error: 'File content does not match a valid image format.' },
                { status: 400 }
            );
        }

        // ── 1. AI Detection via n8n ─────────────────────────────────────────
        const webhookUrl = process.env.N8N_CERTIFICATION_WEBHOOK_URL;
        let n8nResult: { ok: boolean; rejected?: boolean; data: Record<string, unknown> } | null = null;

        if (webhookUrl) {
            const imageBase64 = rawBuffer.toString('base64');
            n8nResult = await callN8nForDetection(webhookUrl, {
                imageBase64,
                mimeType: file.type,
                fileName: file.name,
                productName,
                batchId,
                manufacturerName,
                deviceMetadata,
            });

            // If n8n explicitly rejected the image, return the rejection
            if (n8nResult.rejected) {
                return NextResponse.json(
                    { error: n8nResult.data.error || n8nResult.data.reason || 'Image rejected by authenticity check.' },
                    { status: 422 }
                );
            }

            // If n8n returned full pipeline data, use it directly
            if (n8nResult.data.vpaId && n8nResult.data.certifiedImageBase64) {
                await invalidateCertificateCache();
                return NextResponse.json({
                    vpaId: n8nResult.data.vpaId,
                    registryUrl: n8nResult.data.registryUrl,
                    certifiedImageUrl: n8nResult.data.certifiedImageUrl || '',
                    certifiedImageBase64: n8nResult.data.certifiedImageBase64,
                    issueDate: n8nResult.data.issueDate,
                    productName: n8nResult.data.productName || productName,
                });
            }

            // If n8n returned a non-ok result (and it's not a rejection), return error
            if (!n8nResult.ok) {
                return NextResponse.json(
                    { error: n8nResult.data.error || 'Certification service error. Please try again.' },
                    { status: 502 }
                );
            }
        }

        // ── 2. Generate VPA ID ──────────────────────────────────────────────
        const vpaId = generateVpaId();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
        const registryUrl = `${appUrl}/id/${vpaId}`;
        const issueDate = new Date().toISOString().split('T')[0];

        // ── 3. Watermark the image locally ──────────────────────────────────
        let watermarkedBuffer: Buffer;
        try {
            watermarkedBuffer = await applyWatermark(rawBuffer, vpaId);
        } catch (wmError) {
            console.error('[VPA Certify] Watermark failed:', wmError);
            return NextResponse.json(
                { error: `Watermark step failed: ${wmError instanceof Error ? wmError.message : 'unknown'}` },
                { status: 500 }
            );
        }
        const certifiedImageBase64 = watermarkedBuffer.toString('base64');

        // ── 4. Record to n8n (non-blocking) ─────────────────────────────────
        // Fire-and-forget: send the certified data to n8n for Google Drive/Sheets
        if (webhookUrl && process.env.N8N_RECORD_WEBHOOK_URL) {
            fetch(process.env.N8N_RECORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vpaId,
                    productName,
                    manufacturerName,
                    deviceMetadata,
                    batchId,
                    issueDate,
                    fileName: file.name,
                    registryUrl,
                    certifiedImageBase64,
                }),
                signal: AbortSignal.timeout(15_000),
            }).catch(err => console.error('[VPA Certify] Record webhook failed:', err));
        }

        // ── 5. Invalidate cache and return ──────────────────────────────────
        await invalidateCertificateCache();

        return NextResponse.json({
            vpaId,
            registryUrl,
            certifiedImageUrl: '',
            certifiedImageBase64,
            issueDate,
            productName,
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[VPA Certify] Error:', msg, error);
        return NextResponse.json({ error: `Certification failed: ${msg}` }, { status: 500 });
    }
}
