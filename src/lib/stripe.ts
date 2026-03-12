import Stripe from 'stripe';

// Server-side Stripe client singleton
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
    : null;

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

// Map Stripe price IDs → plan tier
function priceIdToPlan(priceId: string): PlanTier {
    const starterMonthly  = process.env.STRIPE_STARTER_MONTHLY_PRICE_ID;
    const starterAnnual   = process.env.STRIPE_STARTER_ANNUAL_PRICE_ID;
    const proMonthly      = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    const proAnnual       = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

    if (priceId === starterMonthly || priceId === starterAnnual)  return 'starter';
    if (priceId === proMonthly     || priceId === proAnnual)      return 'professional';
    return 'starter'; // default for any other active subscription
}

/**
 * Look up the active Stripe subscription for a given email.
 * Returns 'free' if no active subscription or Stripe is not configured.
 * Called once per sign-in and stored in the JWT for the session lifetime.
 */
export async function getSubscriptionPlan(email: string | null | undefined): Promise<PlanTier> {
    if (!stripe || !email) return 'free';
    try {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (!customers.data.length) return 'free';

        const subs = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: 'active',
            limit: 1,
            expand: ['data.items.data.price'],
        });
        if (!subs.data.length) return 'free';

        const priceId = subs.data[0].items.data[0]?.price?.id ?? '';
        return priceIdToPlan(priceId);
    } catch (err) {
        console.error('[VPA Stripe] plan lookup failed:', err);
        return 'free';
    }
}

/** Map plan → price ID for a checkout session */
export function getPriceId(plan: 'starter' | 'professional', annual: boolean): string | null {
    if (plan === 'starter') {
        return annual
            ? (process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? null)
            : (process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? null);
    }
    return annual
        ? (process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null)
        : (process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null);
}
