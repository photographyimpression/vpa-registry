import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events.  Stripe requires the raw request body for
 * signature verification, so this route disables body parsing.
 *
 * Set STRIPE_WEBHOOK_SECRET to the signing secret shown in the Stripe dashboard
 * (Developers → Webhooks → your endpoint → Signing secret).
 *
 * Events handled:
 *   checkout.session.completed  — new subscription activated
 *   customer.subscription.updated — plan changed or renewal
 *   customer.subscription.deleted — subscription cancelled
 */
export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        console.error('[VPA Stripe Webhook] STRIPE_WEBHOOK_SECRET not set');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature') ?? '';

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (err) {
        console.error('[VPA Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Forward to n8n for persistence (e.g. log to Google Sheets / send welcome email)
    const n8nWebhook = process.env.N8N_STRIPE_WEBHOOK_URL;
    if (n8nWebhook) {
        try {
            await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: event.type, data: event.data }),
                signal: AbortSignal.timeout(8_000),
            }).catch(() => null); // non-fatal
        } catch { /* ignore */ }
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const email = session.customer_email ?? session.metadata?.vpaEmail;
            const plan  = session.metadata?.plan ?? 'starter';
            console.log(`[VPA Stripe] New subscription: ${email} → ${plan}`);
            break;
        }
        case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription;
            console.log(`[VPA Stripe] Subscription updated: ${sub.id} status=${sub.status}`);
            break;
        }
        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            console.log(`[VPA Stripe] Subscription cancelled: ${sub.id}`);
            break;
        }
        default:
            // Ignore other events
            break;
    }

    return NextResponse.json({ received: true });
}
