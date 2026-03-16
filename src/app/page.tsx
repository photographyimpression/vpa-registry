"use client";

import { useEffect, useRef } from 'react';
import SearchPortal from '@/components/SearchPortal';
import AnimatedExplainer from '@/components/AnimatedExplainer';
import Link from 'next/link';
import { ShieldCheck, ScanLine, Globe, ArrowRight, BadgeCheck, Camera, Eye, CheckCircle2, Zap, Lock } from 'lucide-react';
import styles from './Home.module.css';

const STATS = [
    { value: '12,847', label: 'Certificates Issued' },
    { value: '99.99%', label: 'Registry Uptime' },
    { value: '47', label: 'Partner Brands' },
    { value: '2.1M', label: 'Verifications' },
];

const STEPS = [
    {
        num: '01',
        icon: <Camera size={22} />,
        title: 'Upload & Verify',
        desc: 'Partners upload product photos. Our system verifies each image is authentic using metadata forensics and AI detection.',
    },
    {
        num: '02',
        icon: <BadgeCheck size={22} />,
        title: 'Certify & Seal',
        desc: 'Each image receives a unique VPA ID, a certification badge, and a QR code — permanently linked to our public registry.',
    },
    {
        num: '03',
        icon: <Eye size={22} />,
        title: 'Scan & Confirm',
        desc: 'Anyone, anywhere can scan the QR code or enter the ID to confirm the product photo is genuine and unaltered.',
    },
];

const FEATURES = [
    {
        icon: <ScanLine size={22} />,
        title: 'Instant QR Verification',
        desc: 'Every certified image carries a scannable QR code. Verify from any device in seconds.',
        color: 'amber',
    },
    {
        icon: <Globe size={22} />,
        title: 'Public Registry',
        desc: 'Every certificate is published to our open registry. Buyers and regulators can verify independently.',
        color: 'emerald',
    },
    {
        icon: <Lock size={22} />,
        title: 'Partner-Only Issuance',
        desc: 'Only approved brand partners can issue certificates, ensuring every seal traces to a verified source.',
        color: 'blue',
    },
    {
        icon: <Zap size={22} />,
        title: 'AI Detection',
        desc: 'Our pipeline detects AI-generated and digitally altered images before they enter the registry.',
        color: 'purple',
    },
];

const PARTNERS = [
    'Luxora', 'SecureFab', 'AuthNet', 'GlobalVera', 'ChainTrace', 'TrustSeal', 'OriginCheck', 'PurePath',
];

export default function Home() {
    const revealRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.visible);
                }
            });
        }, { threshold: 0.1 });

        const els = document.querySelectorAll(`.${styles.reveal}`);
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <main className={styles.page} ref={revealRef}>
            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className={styles.hero}>
                {/* Gradient orbs */}
                <div className={styles.orbGold} />
                <div className={styles.orbGreen} />
                <div className={styles.orbBlue} />

                <div className={styles.heroInner}>
                    <div className={styles.badge}>
                        <ShieldCheck size={14} />
                        <span>The Global Standard for Product Authenticity</span>
                    </div>

                    <h1 className={styles.headline}>
                        Trust.<br />
                        <span className={styles.headlineAccent}>Certified.</span>
                    </h1>

                    <p className={styles.subhead}>
                        Like a GIA certificate for diamonds — but for every product photo online.
                        We verify, seal, and register images so buyers know what they see is real.
                    </p>

                    {/* Animated explainer */}
                    <div className={styles.videoWrapper}>
                        <AnimatedExplainer />
                    </div>

                    <div className={styles.heroSearch}>
                        <SearchPortal />
                    </div>

                    <div className={styles.heroCtas}>
                        <Link href="/register" className={styles.ctaPrimary}>
                            Become a Certified Partner <ArrowRight size={16} />
                        </Link>
                        <Link href="/verification" className={styles.ctaSecondary}>
                            Verify a Certificate <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Trusted by */}
                <div className={styles.trustedBy}>
                    <p className={styles.trustedLabel}>TRUSTED BY LEADING BRANDS</p>
                    <div className={styles.partnerRow}>
                        {PARTNERS.map((p, i) => (
                            <span key={i} className={styles.partnerName}>{p}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ────────────────────────────────────────────── */}
            <section className={`${styles.statsSection} ${styles.reveal}`}>
                <div className={styles.statsGrid}>
                    {STATS.map((s, i) => (
                        <div key={i} className={styles.statCard}>
                            <span className={styles.statValue}>{s.value}</span>
                            <span className={styles.statLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────── */}
            <section className={styles.howSection}>
                <div className={styles.sectionInner}>
                    <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                        <span className={styles.sectionBadge}>How it works</span>
                        <h2 className={styles.sectionTitle}>
                            Three steps to certified trust
                        </h2>
                        <p className={styles.sectionDesc}>
                            Our streamlined pipeline takes product images from upload to certified in seconds.
                        </p>
                    </div>

                    <div className={styles.stepsGrid}>
                        {STEPS.map((step, i) => (
                            <div key={i} className={`${styles.stepCard} ${styles.reveal}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                                <div className={styles.stepNum}>{step.num}</div>
                                <div className={styles.stepIcon}>{step.icon}</div>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDesc}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────── */}
            <section className={styles.featuresSection}>
                <div className={styles.sectionInner}>
                    <div className={`${styles.sectionHeader} ${styles.reveal}`}>
                        <span className={styles.sectionBadge}>Features</span>
                        <h2 className={styles.sectionTitle}>
                            Built for scale and security
                        </h2>
                    </div>

                    <div className={styles.featuresGrid}>
                        {FEATURES.map((feat, i) => (
                            <div key={i} className={`${styles.featureCard} ${styles[`feature_${feat.color}`]} ${styles.reveal}`} style={{ transitionDelay: `${i * 0.08}s` }}>
                                <div className={styles.featureIcon}>{feat.icon}</div>
                                <h3 className={styles.featureTitle}>{feat.title}</h3>
                                <p className={styles.featureDesc}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VERIFICATION DEMO ────────────────────────────────── */}
            <section className={styles.demoSection}>
                <div className={styles.sectionInner}>
                    <div className={`${styles.demoCard} ${styles.reveal}`}>
                        <div className={styles.demoContent}>
                            <span className={styles.sectionBadge}>Live verification</span>
                            <h2 className={styles.demoTitle}>See it in action</h2>
                            <p className={styles.demoDesc}>
                                Every certified product image carries a unique VPA ID. Scan the QR code or enter the ID to instantly verify authenticity.
                            </p>
                            <div className={styles.demoChecks}>
                                <div className={styles.demoCheck}><CheckCircle2 size={18} /> <span>Image integrity confirmed</span></div>
                                <div className={styles.demoCheck}><CheckCircle2 size={18} /> <span>No AI generation detected</span></div>
                                <div className={styles.demoCheck}><CheckCircle2 size={18} /> <span>Registered to verified partner</span></div>
                            </div>
                        </div>
                        <div className={styles.demoVisual}>
                            <div className={styles.mockCert}>
                                <div className={styles.mockHeader}>
                                    <ShieldCheck size={20} />
                                    <span>VPA CERTIFICATE</span>
                                </div>
                                <div className={styles.mockBody}>
                                    <div className={styles.mockRow}>
                                        <span className={styles.mockLabel}>Registry ID</span>
                                        <span className={styles.mockValue}>VPA-XK4MNR-2847</span>
                                    </div>
                                    <div className={styles.mockRow}>
                                        <span className={styles.mockLabel}>Status</span>
                                        <span className={styles.mockStatus}>VERIFIED AUTHENTIC</span>
                                    </div>
                                    <div className={styles.mockRow}>
                                        <span className={styles.mockLabel}>Issued</span>
                                        <span className={styles.mockValue}>2026-03-12</span>
                                    </div>
                                    <div className={styles.mockRow}>
                                        <span className={styles.mockLabel}>Partner</span>
                                        <span className={styles.mockValue}>Luxora International</span>
                                    </div>
                                </div>
                                <div className={styles.mockQr}>
                                    <ScanLine size={32} strokeWidth={1} />
                                    <span>Scan to verify</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ───────────────────────────────────────── */}
            <section className={`${styles.ctaBanner} ${styles.reveal}`}>
                <div className={styles.ctaBannerOrb} />
                <div className={styles.sectionInner}>
                    <h2 className={styles.ctaBannerTitle}>Ready to certify your product images?</h2>
                    <p className={styles.ctaBannerDesc}>Join the brands building consumer trust through verified product imagery.</p>
                    <div className={styles.ctaBannerActions}>
                        <Link href="/register" className={styles.ctaPrimary}>
                            Apply for Partner Access <ArrowRight size={16} />
                        </Link>
                        <Link href="/verification" className={styles.ctaSecondary}>
                            Verify a Certificate <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
}
