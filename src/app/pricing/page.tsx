"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Package, Building2, Check, ArrowRight, Zap, Loader2, Gift, TrendingUp } from 'lucide-react';
import styles from './Pricing.module.css';

const plans = [
    {
        name: 'Free',
        key: null,
        icon: Gift,
        monthlyPrice: 0,
        annualPrice: 0,
        desc: 'Try VPA on your top items. No credit card required.',
        cta: 'Get Started Free',
        ctaStyle: 'outline',
        href: '/register',
        featured: false,
        features: [
            'Up to 10 certificates / month',
            'Single image upload',
            'QR code verification seal',
            'Public registry listing',
            'VPA trust mark on all certificates',
            'Email support',
        ],
    },
    {
        name: 'Starter',
        key: 'starter' as const,
        icon: Package,
        monthlyPrice: 79,
        annualPrice: 69,
        desc: 'For small shops authenticating their full inventory.',
        cta: 'Start Free Trial',
        ctaStyle: 'gold',
        featured: true,
        features: [
            'Up to 200 certificates / month',
            'Bulk upload (up to 200 images)',
            'Basic analytics dashboard',
            'VPA trust mark on all certificates',
            'Email support',
        ],
    },
    {
        name: 'Professional',
        key: 'professional' as const,
        icon: Zap,
        monthlyPrice: 299,
        annualPrice: 249,
        desc: 'For growing businesses needing analytics and API access.',
        cta: 'Start Free Trial',
        ctaStyle: 'outline',
        featured: false,
        features: [
            'Up to 2,000 certificates / month',
            'Bulk upload (unlimited)',
            'Advanced analytics & reports',
            'API access (10,000 req/day)',
            'Up to 3 team members',
            'Priority email & chat support',
        ],
    },
    {
        name: 'Business',
        key: 'business' as const,
        icon: TrendingUp,
        monthlyPrice: 999,
        annualPrice: 849,
        desc: 'For multi-location businesses and high-volume sellers.',
        cta: 'Start Free Trial',
        ctaStyle: 'outline',
        featured: false,
        features: [
            'Up to 10,000 certificates / month',
            'Bulk upload (unlimited)',
            'Advanced analytics & reports',
            'Shopify / WooCommerce integration',
            'Unlimited API access',
            'Up to 10 team members',
            'Dedicated account manager',
            '99.9% uptime SLA',
        ],
    },
    {
        name: 'Enterprise',
        key: null,
        icon: Building2,
        monthlyPrice: null,
        annualPrice: null,
        desc: 'Custom volume, SLA guarantees, and dedicated infrastructure for large operations.',
        cta: 'Contact Sales',
        ctaStyle: 'outline',
        href: '/enterprise',
        featured: false,
        features: [
            'Unlimited certificates',
            'Bulk upload (unlimited)',
            'Custom cryptographic policies',
            'Dedicated registry namespace',
            'SSO & team management',
            'Unlimited API access',
            'Dedicated account manager',
            'Custom SLA & uptime guarantee',
        ],
    },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleCheckout(plan: 'starter' | 'professional' | 'business') {
        setLoading(plan);
        setError(null);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, annual }),
            });
            const data = await res.json() as { url?: string; error?: string };
            if (!res.ok || !data.url) {
                if (res.status === 401) {
                    window.location.href = `/login?next=/pricing`;
                    return;
                }
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }
            window.location.href = data.url;
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(null);
        }
    }

    return (
        <>
            <main className={styles.pricingPage}>
                <section className={styles.hero}>
                    <span className={styles.eyebrow}>Transparent Pricing</span>
                    <h1 className={styles.heroTitle}>
                        Protect your products.<br />
                        <span>At any scale.</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Every certificate issued through the VPA Registry is cryptographically sealed, globally verifiable, and backed by our authority protocol.
                    </p>
                </section>

                {/* Billing toggle */}
                <div className={styles.toggle}>
                    <span>Monthly</span>
                    <div
                        id="billing-toggle"
                        className={`${styles.toggleSwitch} ${annual ? styles.annual : ''}`}
                        onClick={() => setAnnual(!annual)}
                        role="switch"
                        aria-checked={annual}
                    />
                    <span>Annual</span>
                    {annual && <span className={styles.saveBadge}>Save 20%</span>}
                </div>

                {error && (
                    <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        {error}
                    </p>
                )}

                {/* Plans */}
                <div className={styles.plansGrid}>
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const price = annual ? plan.annualPrice : plan.monthlyPrice;
                        const isLoading = loading === plan.key;

                        return (
                            <div
                                key={plan.name}
                                className={`${styles.planCard} ${plan.featured ? styles.featured : ''}`}
                            >
                                {plan.featured && <span className={styles.featuredBadge}>Most Popular</span>}
                                <div className={styles.planIcon}><Icon size={22} /></div>
                                <div className={styles.planName}>{plan.name}</div>
                                <div className={styles.planPrice}>
                                    {price === 0 ? (
                                        <span className={styles.planPriceAmount}>$0</span>
                                    ) : price !== null ? (
                                        <>
                                            <span className={styles.planPriceAmount}>${price.toLocaleString()}</span>
                                            <span className={styles.planPriceUnit}>/mo</span>
                                            {annual && (
                                                <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginTop: '2px' }}>
                                                    billed ${price * 12}/yr
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className={styles.planPriceAmount} style={{ fontSize: '2rem' }}>Custom</span>
                                    )}
                                </div>
                                <p className={styles.planDesc}>{plan.desc}</p>

                                {plan.key ? (
                                    <button
                                        onClick={() => handleCheckout(plan.key!)}
                                        disabled={isLoading || !!loading}
                                        className={`${styles.planCta} ${plan.ctaStyle === 'gold' ? styles.planCtaGold : styles.planCtaOutline}`}
                                        style={{ cursor: isLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    >
                                        {isLoading
                                            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                                            : <>{plan.cta} <ArrowRight size={14} /></>
                                        }
                                    </button>
                                ) : (
                                    <Link href={(plan as { href?: string }).href!} className={`${styles.planCta} ${styles.planCtaOutline}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        {plan.cta} <ArrowRight size={14} />
                                    </Link>
                                )}

                                <div className={styles.planDivider} />
                                <div className={styles.planFeatureLabel}>Includes</div>
                                <ul className={styles.planFeatureList}>
                                    {plan.features.map((f) => (
                                        <li key={f}>
                                            <Check size={14} className={styles.checkIcon} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Trust band */}
                <section className={styles.trustBand}>
                    <div className={styles.trustBandInner}>
                        <ShieldCheck size={36} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                        <h2 className={styles.trustBandTitle}>Not sure which plan fits?</h2>
                        <p className={styles.trustBandText}>
                            Our team will analyse your production volume, geographic distribution, and regulatory environment to recommend the best fit. No sales pressure — just honest guidance.
                        </p>
                        <Link href="/enterprise" className={styles.trustBandCta}>
                            Talk to an expert <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>
            </main>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}
