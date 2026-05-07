#!/usr/bin/env tsx
/**
 * One-shot Stripe setup for VPA Registry.
 *
 * Creates (idempotently — safe to re-run):
 *   - Product:  "VPA Registry — Starter"        + monthly/annual prices
 *   - Product:  "VPA Registry — Professional"   + monthly/annual prices
 *   - Product:  "VPA Registry — Business"       + monthly/annual prices
 *   - Coupon:   MONTREAL90  (90% off, forever)
 *   - Promo:    code MONTREAL90 → that coupon
 *
 * Prints the env-var lines you need to paste into your hosting platform.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/stripe-setup.ts
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup.ts   # test mode
 *
 * Idempotency: the script searches for existing products/coupons by name/id
 * before creating new ones, so re-running won't duplicate anything.
 *
 * Pricing tiers (must match CLAUDE.md):
 *   Starter        $79/mo   $69/mo billed annually  ($828/yr)
 *   Professional   $299/mo  $249/mo billed annually ($2988/yr)
 *   Business       $999/mo  $849/mo billed annually ($10188/yr)
 */
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
    console.error('Missing STRIPE_SECRET_KEY env var.');
    console.error('Run with: STRIPE_SECRET_KEY=sk_live_... npx tsx scripts/stripe-setup.ts');
    process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' });
const isLive = key.startsWith('sk_live_');

console.log(`\n🟢 Connecting to Stripe in ${isLive ? 'LIVE' : 'TEST'} mode\n`);

// ── Plan definitions ─────────────────────────────────────────────────────────
type PlanDef = {
    key: 'starter' | 'professional' | 'business';
    name: string;
    description: string;
    monthlyCents: number;       // e.g. 7900 = $79.00
    annualMonthlyCents: number; // monthly equivalent of the annual rate
};

const PLANS: PlanDef[] = [
    {
        key: 'starter',
        name: 'VPA Registry — Starter',
        description: '200 certificates per month. For boutiques and small brands.',
        monthlyCents: 7900,
        annualMonthlyCents: 6900,
    },
    {
        key: 'professional',
        name: 'VPA Registry — Professional',
        description: '2,000 certificates per month. For established sellers and small chains.',
        monthlyCents: 29900,
        annualMonthlyCents: 24900,
    },
    {
        key: 'business',
        name: 'VPA Registry — Business',
        description: '10,000 certificates per month. For larger brands and resellers.',
        monthlyCents: 99900,
        annualMonthlyCents: 84900,
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
async function findOrCreateProduct(plan: PlanDef): Promise<Stripe.Product> {
    const existing = await stripe.products.search({
        query: `name:'${plan.name}' AND active:'true'`,
        limit: 1,
    });
    if (existing.data.length > 0) {
        console.log(`  ✓ Product exists: ${plan.name}`);
        return existing.data[0];
    }
    const created = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { vpaPlanKey: plan.key },
    });
    console.log(`  + Created product: ${plan.name}`);
    return created;
}

async function findOrCreatePrice(
    product: Stripe.Product,
    interval: 'month' | 'year',
    amountCents: number,
    nickname: string,
): Promise<Stripe.Price> {
    // Search by product + interval + amount
    const existing = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
    });
    const match = existing.data.find(
        p => p.recurring?.interval === interval && p.unit_amount === amountCents,
    );
    if (match) {
        console.log(`    ✓ Price exists: ${nickname} ($${(amountCents / 100).toFixed(2)} / ${interval})`);
        return match;
    }
    const created = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: amountCents,
        recurring: { interval },
        nickname,
    });
    console.log(`    + Created price: ${nickname} ($${(amountCents / 100).toFixed(2)} / ${interval})`);
    return created;
}

async function findOrCreateCoupon(): Promise<Stripe.Coupon> {
    try {
        const existing = await stripe.coupons.retrieve('MONTREAL90');
        console.log(`  ✓ Coupon exists: MONTREAL90 (${existing.percent_off}% off)`);
        return existing;
    } catch (err) {
        if (err instanceof Stripe.errors.StripeError && err.code === 'resource_missing') {
            const created = await stripe.coupons.create({
                id: 'MONTREAL90',
                name: 'Montreal Launch — 90% Off',
                percent_off: 90,
                duration: 'forever',
            });
            console.log(`  + Created coupon: MONTREAL90 (90% off, forever)`);
            return created;
        }
        throw err;
    }
}

async function findOrCreatePromoCode(coupon: Stripe.Coupon): Promise<Stripe.PromotionCode> {
    const existing = await stripe.promotionCodes.list({
        code: 'MONTREAL90',
        limit: 1,
    });
    if (existing.data.length > 0) {
        console.log(`  ✓ Promo code exists: MONTREAL90`);
        return existing.data[0];
    }
    const created = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: 'MONTREAL90',
        active: true,
    });
    console.log(`  + Created promo code: MONTREAL90`);
    return created;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    const envLines: string[] = [];

    for (const plan of PLANS) {
        console.log(`\n📦 ${plan.name}`);
        const product = await findOrCreateProduct(plan);

        const monthlyPrice = await findOrCreatePrice(
            product,
            'month',
            plan.monthlyCents,
            `${plan.key}-monthly`,
        );
        const annualPrice = await findOrCreatePrice(
            product,
            'year',
            plan.annualMonthlyCents * 12, // annual = 12 × discounted monthly
            `${plan.key}-annual`,
        );

        const envKey = plan.key === 'professional' ? 'PRO' : plan.key.toUpperCase();
        envLines.push(`STRIPE_${envKey}_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
        envLines.push(`STRIPE_${envKey}_ANNUAL_PRICE_ID=${annualPrice.id}`);
    }

    console.log(`\n🎟️  MONTREAL90 promo code`);
    const coupon = await findOrCreateCoupon();
    await findOrCreatePromoCode(coupon);

    console.log(`\n${'='.repeat(72)}`);
    console.log(`✅ Done. Paste these env vars into your hosting platform:`);
    console.log(`${'='.repeat(72)}\n`);
    console.log(envLines.join('\n'));
    console.log(`\n${'='.repeat(72)}`);
    console.log(`Mode: ${isLive ? 'LIVE' : 'TEST'} — ${isLive ? 'real charges will happen' : 'no real charges'}`);
    console.log(`${'='.repeat(72)}\n`);
}

main().catch(err => {
    console.error('\n❌ Setup failed:', err instanceof Error ? err.message : err);
    process.exit(1);
});
