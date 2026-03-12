import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/register
 * Body: { company: string, name: string, email: string }
 *
 * Saves partner access requests. Forwards to the n8n webhook
 * (N8N_REGISTER_WEBHOOK_URL) for processing — e.g. add to Google Sheets,
 * send welcome/review email.  Succeeds gracefully even if n8n is unreachable.
 */
export async function POST(req: NextRequest) {
    const { company, name, email } = await req.json() as {
        company: string;
        name: string;
        email: string;
    };

    if (!company?.trim() || !name?.trim() || !email?.trim()) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_REGISTER_WEBHOOK_URL;
    if (webhookUrl) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: company.trim(),
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    submittedAt: new Date().toISOString(),
                }),
                signal: AbortSignal.timeout(10_000),
            });
        } catch (err) {
            // Non-fatal: log but still return success to the user
            console.error('[VPA Register] n8n webhook error (non-fatal):', err);
        }
    } else {
        // At minimum, log the submission so it's not silently lost
        console.log(`[VPA Register] New access request: ${name} <${email}> from ${company}`);
    }

    return NextResponse.json({ success: true });
}
