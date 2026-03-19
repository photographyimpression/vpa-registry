import { NextRequest, NextResponse } from 'next/server';

const N8N_TRACKING_WEBHOOK_URL = process.env.N8N_TRACKING_WEBHOOK_URL;

/**
 * GET /api/unsubscribe?t=<token>
 *
 * Unsubscribe endpoint. Logs an "unsubscribed" event via the n8n
 * webhook and returns a simple confirmation HTML page.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('t');

    // Fire-and-forget: track the unsubscribe event
    if (token && N8N_TRACKING_WEBHOOK_URL) {
        trackEvent(token).catch(() => {
            // Silently ignore — tracking is non-critical
        });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribed - VPA Registry</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f9fafb;
            color: #111827;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 480px;
        }
        h1 { font-size: 1.5rem; margin-bottom: 1rem; }
        p { color: #6b7280; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Unsubscribed</h1>
        <p>You have been unsubscribed from VPA Registry emails. You will no longer receive messages from us.</p>
    </div>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}

async function trackEvent(token: string): Promise<void> {
    await fetch(N8N_TRACKING_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token,
            event: 'unsubscribed',
            timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(5_000),
    });
}
