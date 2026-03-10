import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import QRCode from 'qrcode';

export const maxDuration = 60;

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
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('imageUrl');
    const vpaId = searchParams.get('vpaId');
    return processWatermark(imageUrl, vpaId);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    return processWatermark(body.imageUrl, body.vpaId);
}

async function processWatermark(imageUrl: string | null, vpaId: string | null): Promise<NextResponse> {
    if (!imageUrl || !vpaId) {
        return NextResponse.json({ error: 'imageUrl and vpaId are required' }, { status: 400 });
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
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="VPA-${vpaId}-certified.png"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('[VPA Watermark] Error:', error);
        return NextResponse.json({ error: 'Watermark generation failed' }, { status: 500 });
    }
}

export async function applyWatermark(imageBuffer: Buffer, vpaId: string): Promise<Buffer> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
    const certUrl = `${appUrl}/id/${vpaId}`;

    // Get source image dimensions
    const meta = await sharp(imageBuffer).metadata();
    const width = meta.width || 800;
    const height = meta.height || 600;

    // Scale QR code proportionally (roughly 14% of the shorter dimension)
    const qrSize = Math.max(80, Math.min(160, Math.floor(Math.min(width, height) * 0.14)));
    const padding = Math.max(12, Math.floor(qrSize * 0.12));

    // --- Generate QR code PNG ---
    const qrBuffer = await QRCode.toBuffer(certUrl, {
        type: 'png',
        width: qrSize,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
    });

    // --- Add white border + drop shadow around QR ---
    const qrBorder = 6;
    const qrWithBorder = await sharp({
        create: {
            width: qrSize + qrBorder * 2,
            height: qrSize + qrBorder * 2,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    })
        .composite([{ input: qrBuffer, top: qrBorder, left: qrBorder }])
        .png()
        .toBuffer();

    const qrFinalSize = qrSize + qrBorder * 2;

    // --- Certification badge SVG (bottom-left) ---
    const badgeW = Math.min(260, Math.floor(width * 0.32));
    const badgeH = 52;
    const goldColor = '#C8A96E';
    const badge = Buffer.from(`
        <svg width="${badgeW}" height="${badgeH}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${badgeW}" height="${badgeH}" rx="5"
            fill="rgba(0,0,0,0.78)" />
          <line x1="0" y1="0" x2="${badgeW}" y2="0"
            stroke="${goldColor}" stroke-width="2"/>
          <text x="10" y="20"
            font-family="Arial, Helvetica, sans-serif"
            font-size="11" font-weight="bold" fill="${goldColor}">VPA REGISTRY</text>
          <text x="10" y="34"
            font-family="Courier New, Courier, monospace"
            font-size="9" fill="#FFFFFF">${vpaId}</text>
          <text x="10" y="47"
            font-family="Arial, Helvetica, sans-serif"
            font-size="7.5" fill="rgba(255,255,255,0.55)">CERTIFIED AUTHENTIC · vparegistry.com</text>
        </svg>`);

    // --- Composite everything ---
    return sharp(imageBuffer)
        .composite([
            // QR code — bottom-right corner
            {
                input: qrWithBorder,
                top: height - qrFinalSize - padding,
                left: width - qrFinalSize - padding,
                blend: 'over',
            },
            // Badge — bottom-left corner
            {
                input: badge,
                top: height - badgeH - padding,
                left: padding,
                blend: 'over',
            },
        ])
        .png()
        .toBuffer();
}
