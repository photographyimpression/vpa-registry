import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session so users can manage their
 * subscription, update payment methods, view invoices, and cancel.
 * Requires an active session.
 */
export async function POST() {
    if (!stripe) {
        return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
    if (!customers.data.length) {
        return NextResponse.json(
            { error: 'No billing account found. Please subscribe first.' },
            { status: 404 }
        );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com';
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: `${appUrl}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
}
