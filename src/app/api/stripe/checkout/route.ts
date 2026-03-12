import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe, getPriceId } from '@/lib/stripe';

/**
 * POST /api/stripe/checkout
 * Body: { plan: 'starter' | 'professional', annual: boolean }
 *
 * Creates a Stripe Checkout session and returns the redirect URL.
 * Requires an active session; the user's email is pre-filled in Stripe.
 */
export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { plan, annual } = await req.json() as { plan: 'starter' | 'professional'; annual: boolean };
    if (!plan || !['starter', 'professional'].includes(plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = getPriceId(plan, annual);
    if (!priceId) {
        return NextResponse.json({ error: 'Plan price not configured. Please contact support.' }, { status: 503 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: session.user.email,
        success_url: `${appUrl}/dashboard?subscribed=1&plan=${plan}`,
        cancel_url: `${appUrl}/pricing?cancelled=1`,
        allow_promotion_codes: true,
        subscription_data: {
            metadata: { vpaEmail: session.user.email, plan },
        },
        metadata: { vpaEmail: session.user.email, plan },
    });

    return NextResponse.json({ url: checkoutSession.url });
}
