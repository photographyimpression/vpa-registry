import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { applyWatermark } from '@/app/api/watermark/route';

export const maxDuration = 60;

const WATERMARK_SECRET = process.env.WATERMARK_SECRET;

function isAuthorized(req: NextRequest): boolean {
    if (!WATERMARK_SECRET) return true;
    return req.headers.get('x-vpa-secret') === WATERMARK_SECRET;
}

/**
 * POST /api/watermark-preview
 *
 * Accepts multipart/form-data with:
 *   - image: File
 *   - vpaId: string (optional, defaults to "VPA-PREVIEW-XXXX")
 *
 * Applies the VPA badge + QR code overlay plus a diagonal "PREVIEW"
 * text watermark across the image.
 *
 * Returns JSON: { image: "base64...", vpaId: "..." }
 */
export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        const vpaId =
            (formData.get('vpaId') as string) ||
            `VPA-PREVIEW-${String(Math.floor(1000 + Math.random() * 9000))}`;

        const rawBuffer = Buffer.from(await file.arrayBuffer());

        // 1. Apply the standard VPA badge + QR code overlay
        const badgedBuffer = await applyWatermark(rawBuffer, vpaId);

        // 2. Add diagonal "PREVIEW" text watermark
        const meta = await sharp(badgedBuffer).metadata();
        const width = meta.width || 800;
        const height = meta.height || 600;

        const previewSvg = buildPreviewOverlay(width, height);

        const finalBuffer = await sharp(badgedBuffer)
            .composite([
                {
                    input: Buffer.from(previewSvg),
                    top: 0,
                    left: 0,
                    blend: 'over',
                },
            ])
            .png()
            .toBuffer();

        return NextResponse.json({
            image: finalBuffer.toString('base64'),
            vpaId,
        });
    } catch (error) {
        console.error('[VPA Watermark Preview] Error:', error);
        return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 });
    }
}

/**
 * Builds an SVG overlay with repeating diagonal "PREVIEW" text
 * that covers the entire image.
 */
function buildPreviewOverlay(width: number, height: number): string {
    const fontSize = Math.max(32, Math.floor(Math.min(width, height) * 0.08));
    const diagonal = Math.sqrt(width * width + height * height);
    const angle = -Math.atan2(height, width) * (180 / Math.PI);

    // Create multiple rows of "PREVIEW" text across the diagonal
    const lines: string[] = [];
    const spacing = fontSize * 3;
    const numRows = Math.ceil(diagonal / spacing) + 2;

    for (let i = -numRows; i <= numRows; i++) {
        const y = height / 2 + i * spacing;
        lines.push(
            `<text x="${width / 2}" y="${y}" ` +
                `font-family="Arial, Helvetica, sans-serif" ` +
                `font-size="${fontSize}" font-weight="bold" ` +
                `fill="rgba(255,255,255,0.35)" ` +
                `text-anchor="middle" ` +
                `transform="rotate(${angle}, ${width / 2}, ${height / 2})"` +
                `>PREVIEW  PREVIEW  PREVIEW  PREVIEW</text>`
        );
    }

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${lines.join('\n        ')}
    </svg>`;
}
