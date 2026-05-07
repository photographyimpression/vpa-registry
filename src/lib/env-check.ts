/**
 * Production env-var validation.
 *
 * Called from instrumentation.ts on server boot. Fails fast (throws) in
 * production if any required variable is missing or still set to a placeholder
 * value, so a misconfigured deploy never silently degrades core features
 * (no AI check, no cert lookup, no Stripe webhooks, etc.).
 *
 * In development the same checks log a warning but don't throw, so local work
 * isn't blocked.
 */

type EnvRule = {
    name: string;
    why: string;
    placeholderPatterns?: RegExp[];
};

const REQUIRED_IN_PRODUCTION: EnvRule[] = [
    { name: 'AUTH_SECRET',                     why: 'NextAuth session encryption — sessions break without it',
        placeholderPatterns: [/^your-generated-secret-here$/i, /^changeme/i] },
    { name: 'AUTH_URL',                        why: 'NextAuth canonical URL — OAuth callbacks fail without it' },
    { name: 'GOOGLE_CLIENT_ID',                why: 'Google OAuth — partner sign-in is broken without it',
        placeholderPatterns: [/^PASTE_/i] },
    { name: 'GOOGLE_CLIENT_SECRET',            why: 'Google OAuth secret',
        placeholderPatterns: [/^PASTE_/i] },
    { name: 'GOOGLE_SHEETS_CSV_URL',           why: 'Registry data — every QR scan returns "not found" without it' },
    { name: 'N8N_CERTIFICATION_WEBHOOK_URL',   why: 'AI authenticity check — certificates are issued without auth check otherwise' },
    { name: 'WATERMARK_SECRET',                why: 'n8n → /api/watermark auth — watermarking fails or is unprotected without it' },
    { name: 'UPSTASH_REDIS_REST_URL',          why: 'Distributed rate limiting + cert cache' },
    { name: 'UPSTASH_REDIS_REST_TOKEN',        why: 'Distributed rate limiting + cert cache' },
    { name: 'STRIPE_SECRET_KEY',               why: 'Stripe API access — billing is broken without it',
        placeholderPatterns: [/^sk_live_\.\.\.$/, /^sk_test_\.\.\.$/] },
    // STRIPE_PUBLISHABLE_KEY is currently unused server-side — checkout uses redirect, not client-side Elements.
    // Kept in env.example so a future client-side payment UI works without surgery here.
    { name: 'STRIPE_WEBHOOK_SECRET',           why: 'Stripe webhook signature verification — subscriptions never activate',
        placeholderPatterns: [/^whsec_\.\.\.$/] },
    { name: 'STRIPE_STARTER_MONTHLY_PRICE_ID', why: 'Starter monthly checkout',  placeholderPatterns: [/^price_\.\.\.$/] },
    { name: 'STRIPE_STARTER_ANNUAL_PRICE_ID',  why: 'Starter annual checkout',   placeholderPatterns: [/^price_\.\.\.$/] },
    { name: 'STRIPE_PRO_MONTHLY_PRICE_ID',     why: 'Professional monthly checkout', placeholderPatterns: [/^price_\.\.\.$/] },
    { name: 'STRIPE_PRO_ANNUAL_PRICE_ID',      why: 'Professional annual checkout',  placeholderPatterns: [/^price_\.\.\.$/] },
    // STRIPE_BUSINESS_*_PRICE_ID are intentionally OPTIONAL: if unset, Business plan checkout
    // returns a 503 "contact support" message; Starter and Pro continue to work. Add the
    // two env vars once you decide on Business pricing in Stripe.
    { name: 'NEXT_PUBLIC_APP_URL',             why: 'Used in QR codes baked into certificates — wrong URL = broken QR codes' },
];

function isMissingOrPlaceholder(rule: EnvRule): { ok: boolean; reason: 'missing' | 'placeholder' | null } {
    const value = process.env[rule.name];
    if (!value || !value.trim()) return { ok: false, reason: 'missing' };
    if (rule.placeholderPatterns?.some(p => p.test(value))) return { ok: false, reason: 'placeholder' };
    return { ok: true, reason: null };
}

export function validateEnv(): void {
    const isProd = process.env.NODE_ENV === 'production';
    const failures: { name: string; reason: 'missing' | 'placeholder'; why: string }[] = [];

    for (const rule of REQUIRED_IN_PRODUCTION) {
        const { ok, reason } = isMissingOrPlaceholder(rule);
        if (!ok && reason) failures.push({ name: rule.name, reason, why: rule.why });
    }

    if (failures.length === 0) {
        console.info('[VPA Env] All required env vars present.');
        return;
    }

    const lines = failures.map(f => `  • ${f.name} (${f.reason}) — ${f.why}`);
    const message =
        `[VPA Env] ${failures.length} required environment variable(s) ${isProd ? 'missing/placeholder' : 'not set (dev)'}:\n` +
        lines.join('\n');

    if (isProd) {
        console.error(message);
        throw new Error(
            `Refusing to start: ${failures.length} required env var(s) missing or placeholder. ` +
            `See server logs for the full list.`
        );
    }

    console.warn(message);
    console.warn('[VPA Env] Continuing because NODE_ENV !== "production".');
}
