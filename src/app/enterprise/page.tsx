import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Building, LockKeyhole, FileKey, BarChart3, Users2, Workflow } from 'lucide-react';

export default function Enterprise() {
    return (
        <main className={styles.mainContainer}>
            <div className={mktgStyles.marketingHero}>
                <div className={mktgStyles.marketingBadge}>VPA Enterprise</div>
                <h1 className={mktgStyles.marketingTitle}>Scale your trust operations.</h1>
                <p className={mktgStyles.marketingSubtitle}>
                    Dedicated API access, custom verification portal white-labeling, and direct integration support for high-volume certification operations.
                </p>
                <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', margin: '0 auto', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} /> Return to Portal
                </Link>
            </div>

            <div className={mktgStyles.marketingSection}>
                <div className={mktgStyles.imageMockup}>
                    <Image
                        src="/mockups/enterprise.png"
                        alt="VPA Enterprise Security"
                        width={800}
                        height={600}
                        layout="responsive"
                    />
                </div>
                <div>
                    <h2 className={mktgStyles.marketingTitle} style={{ fontSize: '2.5rem', textAlign: 'left' }}>High-volume issuance. <br />Built for enterprise.</h2>
                    <p className={mktgStyles.marketingSubtitle} style={{ textAlign: 'left', margin: '1.5rem 0' }}>
                        Enterprise partners get dedicated access to our issuance API, with priority support and custom SLA arrangements to match your operational requirements.
                    </p>
                    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <BarChart3 size={20} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
                            <strong>Volume Tiers</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Optimized pricing for manufacturing giants.</p>
                        </div>
                        <div>
                            <Users2 size={20} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
                            <strong>Role RBAC</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Granular permissions for your global team.</p>
                        </div>
                        <div>
                            <Workflow size={20} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
                            <strong>ERP Connect</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>API-first design for straightforward integration with your existing ERP or PIM systems.</p>
                        </div>
                        <div>
                            <LockKeyhole size={20} color="var(--accent-color)" style={{ marginBottom: '0.5rem' }} />
                            <strong>99.99% SLA</strong>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Contractual uptime and support guarantees.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={mktgStyles.marketingFeatures}>
                <div className={mktgStyles.featureBlock}>
                    <Building size={32} className={mktgStyles.featureIcon} />
                    <h3>White-Glove Integration</h3>
                    <p>A dedicated technical account manager to assist with ERP integration, ensuring seamless automated certificate generation.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <FileKey size={32} className={mktgStyles.featureIcon} />
                    <h3>Bulk Issuance API</h3>
                    <p>Issue certificates in bulk via our REST API, designed to fit into existing manufacturing and logistics workflows.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <LockKeyhole size={32} className={mktgStyles.featureIcon} />
                    <h3>SLA & Compliance</h3>
                    <p>Contractual uptime and support guarantees tailored to your business requirements.</p>
                </div>
            </div>
        </main>
    );
}
