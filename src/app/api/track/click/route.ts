import { NextRequest, NextResponse } from 'next/server';

const N8N_TRACKING_WEBHOOK_URL = process.env.N8N_TRACKING_WEBHOOK_URL;
const FALLBACK_URL = 'https://vparegistry.com';

/**
 * GET /api/track/click?t=<token>&r=<redirect_url>
 *
 * Click-tracking redirect endpoint. Logs a "clicked" event via the n8n
 * webhook, then 302-redirects to the target URL.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('t');
    const redirectUrl = searchParams.get('r');

    // Validate redirect URL
    const destination = validateRedirectUrl(redirectUrl);

    // Fire-and-forget: track the click event (non-blocking)
    if (token && N8N_TRACKING_WEBHOOK_URL) {
        trackEvent(token, 'clicked', destination).catch(() => {
            // Silently ignore — tracking is non-critical
        });
    }

    return NextResponse.redirect(destination, 302);
}

/**
 * Validates the redirect URL. Must be a valid URL starting with https://.
 * Returns the fallback URL if invalid or missing.
 */
function validateRedirectUrl(url: string | null): string {
    if (!url) return FALLBACK_URL;

    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:') return FALLBACK_URL;
        return url;
    } catch {
        return FALLBACK_URL;
    }
}

async function trackEvent(token: string, event: string, redirectUrl: string): Promise<void> {
    await fetch(N8N_TRACKING_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token,
            event,
            redirectUrl,
            timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5_000),
    });
}
