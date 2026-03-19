import { NextRequest, NextResponse } from 'next/server';

/**
 * 1x1 transparent PNG pixel (base64-decoded at module load).
 * Returned on every request regardless of tracking success.
 */
const TRANSPARENT_PIXEL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB' +
        'Nl7BcQAAAABJRU5ErkJggg==',
    'base64'
);

const N8N_TRACKING_WEBHOOK_URL = process.env.N8N_TRACKING_WEBHOOK_URL;

/**
 * GET /api/track/open?t=<token>
 *
 * Tracking pixel endpoint. Logs an "opened" event via the n8n webhook
 * and returns a 1x1 transparent PNG regardless of tracking outcome.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('t');

    // Fire-and-forget: track the open event (non-blocking)
    if (token && N8N_TRACKING_WEBHOOK_URL) {
        trackEvent(token, 'opened').catch(() => {
            // Silently ignore — tracking is non-critical
        });
    }

    return new NextResponse(TRANSPARENT_PIXEL, {
        status: 200,
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-store, no-cache',
            'Content-Length': String(TRANSPARENT_PIXEL.length),
        },
    });
}

async function trackEvent(token: string, event: string): Promise<void> {
    await fetch(N8N_TRACKING_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token,
            event,
            timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5_000),
    });
}
