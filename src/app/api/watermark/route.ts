import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import QRCode from 'qrcode';

export const maxDuration = 60;

// Load a file from public/ — works both locally (filesystem) and on Vercel (CDN fetch)
async function loadPublicFile(filename: string): Promise<Buffer> {
    // Try filesystem first (works in dev and some deploy targets)
    try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.resolve(process.cwd(), 'public', filename);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath);
        }
    } catch { /* filesystem not available */ }

    // Fallback: fetch from the app's own URL (Vercel CDN serves public/ files)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
    const res = await fetch(`${appUrl}/${filename}`);
    if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

// Shared secret for n8n → /api/watermark calls.
// REQUIRED in production. In dev, endpoint is open if unset.
const WATERMARK_SECRET = process.env.WATERMARK_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function isAuthorized(req: NextRequest): boolean {
    if (!WATERMARK_SECRET) {
        if (IS_PRODUCTION) {
            console.error('[VPA Watermark] WATERMARK_SECRET is required in production.');
            return false;
        }
        return true; // open in dev
    }
    return req.headers.get('x-vpa-watermark-secret') === WATERMARK_SECRET;
}

/**
 * GET /api/watermark?imageUrl=...&vpaId=...
 *
 * Called by n8n (HTTP Request node). Fetches the source image,
 * composites the VPA certification badge + QR code onto it,
 * and returns the watermarked JPEG as binary.
 *
 * POST accepts JSON body:
 *   { imageUrl, vpaId }        — fetches image from URL, returns binary JPEG
 *   { imageBase64, vpaId }     — decodes base64 directly, returns JSON { watermarkedImageBase64 }
 */
export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('imageUrl');
    const vpaId = searchParams.get('vpaId');
    return processWatermark(imageUrl, vpaId);
}

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();

    // Base64 path: n8n sends raw image as base64, receives watermarked base64 JSON back
    if (body.imageBase64 && body.vpaId) {
        return processWatermarkBase64(body.imageBase64, body.vpaId);
    }

    return processWatermark(body.imageUrl, body.vpaId);
}

async function processWatermarkBase64(imageBase64: string, vpaId: string): Promise<NextResponse> {
    try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const watermarked = await applyWatermark(imageBuffer, vpaId);
        return NextResponse.json({ watermarkedImageBase64: watermarked.toString('base64') });
    } catch (error) {
        console.error('[VPA Watermark] Base64 error:', error);
        return NextResponse.json({ error: 'Watermark generation failed' }, { status: 500 });
    }
}

const ALLOWED_IMAGE_HOSTS = [
    'storage.googleapis.com',
    'vparegistry.com',
    'www.vparegistry.com',
];

async function processWatermark(imageUrl: string | null, vpaId: string | null): Promise<NextResponse> {
    if (!imageUrl || !vpaId) {
        return NextResponse.json({ error: 'imageUrl and vpaId are required' }, { status: 400 });
    }

    // SSRF protection: only allow trusted hosts
    try {
        const parsed = new URL(imageUrl);
        if (!ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) {
            return NextResponse.json({ error: 'imageUrl host is not allowed' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid imageUrl' }, { status: 400 });
    }

    try {
        // Fetch source image
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`);
        const imageArrayBuffer = await imageRes.arrayBuffer();
        const imageBuffer = Buffer.from(new Uint8Array(imageArrayBuffer));

        const watermarked = await applyWatermark(imageBuffer, vpaId);

        return new NextResponse(new Uint8Array(watermarked), {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition': `attachment; filename="VPA-${vpaId}-certified.jpg"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('[VPA Watermark] Error:', error);
        return NextResponse.json({ error: 'Watermark generation failed' }, { status: 500 });
    }
}

const MIN_CERTIFIABLE_DIM = 300;

// Template positions (relative to 2500x2500 template)
const TMPL_SIZE = 2500;
const QR_LEFT = 2315;
const QR_TOP = 2335;
const QR_DIM = 160;
const CERT_TEXT_X = 542;
const CERT_TEXT_Y = 2420;

export async function applyWatermark(imageBuffer: Buffer, vpaId: string): Promise<Buffer> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
    const certUrl = `${appUrl}/id/${vpaId}`;

    const meta = await sharp(imageBuffer).metadata();
    let width = meta.width || 800;
    let height = meta.height || 600;

    const MAX_DIM = 4096;
    if (width > MAX_DIM || height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        imageBuffer = await sharp(imageBuffer)
            .resize(width, height, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();
    }

    if (width < MIN_CERTIFIABLE_DIM || height < MIN_CERTIFIABLE_DIM) {
        const scale = MIN_CERTIFIABLE_DIM / Math.min(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        imageBuffer = await sharp(imageBuffer)
            .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .toBuffer();
    }

    // Load the pre-designed banner template PNG (2500x2500, has transparency)
    const templateBuffer = await loadPublicFile('banner-template.png');

    // Scale factor from template to product image
    const scale = width / TMPL_SIZE;

    // Generate QR code at the right size for the template
    const qrSize = Math.round(QR_DIM * scale);
    const qrBuffer = await QRCode.toBuffer(certUrl, {
        type: 'png',
        width: qrSize,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
    });

    // Certificate number text overlay — aligned with template title text
    const certFontSize = Math.max(10, Math.round(28 * scale));
    const certTextX = Math.round(width * 0.208);
    const certTextY = height - Math.round((TMPL_SIZE - CERT_TEXT_Y) * scale);
    const certTextSvg = Buffer.from(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <text x="${certTextX}" y="${certTextY}"
                font-family="Courier New, Courier, monospace"
                font-size="${certFontSize}" fill="#FFFFFF">${vpaId}</text>
        </svg>`);

    // Scale the template to match product image width, then crop/extend to product height
    const scaledTemplateHeight = Math.round(TMPL_SIZE * scale);
    let overlay: Buffer;

    if (height >= scaledTemplateHeight) {
        // Product is taller than scaled template: place template at bottom
        const scaledTemplate = await sharp(templateBuffer)
            .resize(width, scaledTemplateHeight, { fit: 'fill' })
            .png()
            .toBuffer();

        // Create a full-height transparent canvas with the template at the bottom
        const canvas = await sharp({
            create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
        }).png().toBuffer();

        overlay = await sharp(canvas)
            .composite([{ input: scaledTemplate, top: height - scaledTemplateHeight, left: 0 }])
            .png()
            .toBuffer();
    } else {
        // Product is shorter: crop the template from the bottom
        const scaledTemplate = await sharp(templateBuffer)
            .resize(width, scaledTemplateHeight, { fit: 'fill' })
            .png()
            .toBuffer();

        overlay = await sharp(scaledTemplate)
            .extract({ left: 0, top: scaledTemplateHeight - height, width, height })
            .png()
            .toBuffer();
    }

    // Composite: product image + template overlay + QR code + cert text
    const qrLeft = Math.round(QR_LEFT * scale);
    const qrTop = height - Math.round((TMPL_SIZE - QR_TOP) * scale);

    return sharp(imageBuffer)
        .composite([
            { input: overlay, top: 0, left: 0, blend: 'over' },
            { input: qrBuffer, top: qrTop, left: qrLeft },
            { input: certTextSvg, top: 0, left: 0 },
        ])
        .jpeg({ quality: 85 })
        .toBuffer();
}
