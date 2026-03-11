"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Package, Building2, Check, ArrowRight, Zap } from 'lucide-react';
import styles from './Pricing.module.css';

const plans = [
    {
        name: 'Starter',
        icon: Package,
        monthlyPrice: 49,
        annualPrice: 39,
        desc: 'For small producers and individual artisans who need core authenticity protection.',
        cta: 'Get Started',
        ctaStyle: 'outline',
        href: '/register',
        featured: false,
        features: [
            'Up to 100 certificates / month',
            'Single image upload',
            'QR code verification seal',
            'Public registry listing',
            'Basic analytics dashboard',
            'Email support',
        ],
    },
    {
        name: 'Professional',
        icon: Zap,
        monthlyPrice: 149,
        annualPrice: 119,
        desc: 'For growing brands that need bulk operations and business-grade tooling.',
        cta: 'Start Free Trial',
        ctaStyle: 'gold',
        href: '/register',
        featured: true,
        features: [
            'Up to 2,000 certificates / month',
            'Bulk upload (up to 200 images)',
            'Cryptographic proof of issuance',
            'Priority registry listing',
            'Advanced analytics',
            'API access (1,000 req/day)',
            'Priority email & chat support',
        ],
    },
    {
        name: 'Enterprise',
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

                {/* Plans */}
                <div className={styles.plansGrid}>
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const price = annual ? plan.annualPrice : plan.monthlyPrice;
                        return (
                            <div
                                key={plan.name}
                                className={`${styles.planCard} ${plan.featured ? styles.featured : ''}`}
                            >
                                {plan.featured && <span className={styles.featuredBadge}>Most Popular</span>}
                                <div className={styles.planIcon}>
                                    <Icon size={22} />
                                </div>
                                <div className={styles.planName}>{plan.name}</div>
                                <div className={styles.planPrice}>
                                    {price !== null ? (
                                        <>
                                            <span className={styles.planPriceAmount}>${price}</span>
                                            <span className={styles.planPriceUnit}>/mo</span>
                                        </>
                                    ) : (
                                        <span className={styles.planPriceAmount} style={{ fontSize: '2rem' }}>Custom</span>
                                    )}
                                </div>
                                <p className={styles.planDesc}>{plan.desc}</p>
                                <Link
                                    href={plan.href}
                                    className={`${styles.planCta} ${plan.ctaStyle === 'gold' ? styles.planCtaGold : styles.planCtaOutline}`}
                                >
                                    {plan.cta} <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                </Link>
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
        </>
    );
}
