import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import QRCode from 'qrcode';

export const maxDuration = 60;

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
 * and returns the watermarked PNG as binary.
 *
 * Also accepts POST with JSON body { imageUrl, vpaId }
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
    return processWatermark(body.imageUrl, body.vpaId);
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

const MIN_CERTIFIABLE_DIM = 300; // minimum px for either dimension

export async function applyWatermark(imageBuffer: Buffer, vpaId: string): Promise<Buffer> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
    const certUrl = `${appUrl}/id/${vpaId}`;

    // Get source image dimensions
    const meta = await sharp(imageBuffer).metadata();
    let width = meta.width || 800;
    let height = meta.height || 600;

    // Cap dimensions to limit memory usage during compositing.
    // A 6000×4000 JPEG is ~72 MB uncompressed (RGB); keeping it reasonable.
    const MAX_DIM = 4096;
    if (width > MAX_DIM || height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        imageBuffer = await sharp(imageBuffer)
            .resize(width, height, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();
    }

    // Enforce minimum dimensions so overlays always fit
    if (width < MIN_CERTIFIABLE_DIM || height < MIN_CERTIFIABLE_DIM) {
        const scale = MIN_CERTIFIABLE_DIM / Math.min(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        imageBuffer = await sharp(imageBuffer)
            .resize(width, height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .toBuffer();
    }

    // --- Trust banner (full-width bar at bottom) ---
    const bannerHeight = Math.max(70, Math.min(100, Math.floor(height * 0.08)));
    const logoSize = bannerHeight - 16;
    const bannerQrSize = bannerHeight - 16;
    const goldColor = '#C8A96E';
    const titleFontSize = Math.max(13, Math.floor(bannerHeight * 0.19));
    const idFontSize = Math.max(10, Math.floor(bannerHeight * 0.14));
    const subtitleFontSize = Math.max(8, Math.floor(bannerHeight * 0.11));
    const scanFontSize = Math.max(7, Math.floor(bannerHeight * 0.09));
    const textLeft = 8 + logoSize + 14;

    // Resize VPA logo for banner
    const fs = await import('fs');
    const path = await import('path');
    const logoPath = path.resolve(process.cwd(), 'public/vpa-logo-square.png');
    const logoBuffer = await sharp(fs.readFileSync(logoPath))
        .resize(logoSize, logoSize, { fit: 'cover' })
        .png()
        .toBuffer();

    // Generate banner QR code
    const bannerQrBuffer = await QRCode.toBuffer(certUrl, {
        type: 'png',
        width: bannerQrSize,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
    });

    // Banner background
    const bannerBg = await sharp({
        create: {
            width: width,
            height: bannerHeight,
            channels: 4,
            background: { r: 15, g: 20, b: 30, alpha: 230 },
        },
    }).png().toBuffer();

    // Banner text SVG
    const bannerTextSvg = Buffer.from(`
        <svg width="${width}" height="${bannerHeight}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${width}" height="2" fill="${goldColor}" />
            <text x="${textLeft}" y="${Math.floor(bannerHeight * 0.32)}"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${titleFontSize}" font-weight="bold" fill="${goldColor}"
                letter-spacing="2">VPA VERIFIED · REAL IMAGE</text>
            <text x="${textLeft}" y="${Math.floor(bannerHeight * 0.55)}"
                font-family="Courier New, Courier, monospace"
                font-size="${idFontSize}" fill="#FFFFFF">${vpaId}</text>
            <text x="${textLeft}" y="${Math.floor(bannerHeight * 0.76)}"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${subtitleFontSize}" fill="rgba(255,255,255,0.55)">Scan QR to confirm at vparegistry.com</text>
            <text x="${width - bannerQrSize - 8 - 8}" y="${Math.floor(bannerHeight * 0.42)}"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${scanFontSize}" font-weight="bold" fill="${goldColor}"
                text-anchor="end" letter-spacing="1">SCAN TO</text>
            <text x="${width - bannerQrSize - 8 - 8}" y="${Math.floor(bannerHeight * 0.62)}"
                font-family="Arial, Helvetica, sans-serif"
                font-size="${scanFontSize}" font-weight="bold" fill="${goldColor}"
                text-anchor="end" letter-spacing="1">VERIFY</text>
        </svg>`);

    // Compose the banner
    const bannerComposite = await sharp(bannerBg)
        .composite([
            { input: bannerTextSvg, top: 0, left: 0 },
            { input: logoBuffer, top: 8, left: 8 },
            { input: bannerQrBuffer, top: 8, left: width - bannerQrSize - 8 },
        ])
        .png()
        .toBuffer();

    // --- Composite banner onto original image ---
    // Use JPEG output (quality 92) to reduce memory + output size vs PNG.
    return sharp(imageBuffer)
        .composite([
            {
                input: bannerComposite,
                top: height - bannerHeight,
                left: 0,
                blend: 'over',
            },
        ])
        .jpeg({ quality: 92 })
        .toBuffer();
}
