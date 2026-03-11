import { NextRequest, NextResponse } from 'next/server';
import { applyWatermark } from '@/app/api/watermark/route';
import { auth } from '@/auth';

export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

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

    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        const productName = (formData.get('productName') as string) || 'Unknown Product';
        const batchId = (formData.get('batchId') as string) || 'N/A';

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}. Accepted: JPEG, PNG, WebP, TIFF` },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: 'File too large. Maximum allowed size is 50 MB.' },
                { status: 400 }
            );
        }

        // ── 1. Generate VPA ID ──────────────────────────────────────────────
        const vpaId = generateVpaId();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
        const registryUrl = `${appUrl}/id/${vpaId}`;
        const issueDate = new Date().toISOString().split('T')[0];

        // ── 2. Watermark the image ──────────────────────────────────────────
        const rawBuffer = Buffer.from(await file.arrayBuffer());
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
                });

                if (n8nRes.ok) {
                    const n8nData = await n8nRes.json();
                    certifiedImageUrl = n8nData.certifiedImageUrl || '';
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
