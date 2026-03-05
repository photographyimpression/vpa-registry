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
                    Dedicated issuance keys, custom verification portal white-labeling, and direct API access to our immutable ledger for volume operations.
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
                    <h2 className={mktgStyles.marketingTitle} style={{ fontSize: '2.5rem', textAlign: 'left' }}>High-volume issuance. <br />Bank-grade security.</h2>
                    <p className={mktgStyles.marketingSubtitle} style={{ textAlign: 'left', margin: '1.5rem 0' }}>
                        Enterprise partners get exclusive access to our low-latency issuance API, allowing for the generation of millions of certificates per day with guaranteed availability.
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
                            <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Native plugins for SAP, Oracle, and more.</p>
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
                    <p>Issue thousands of certificates concurrently with our GraphQL enterprise endpoint directly connected to your manufacturing line.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <LockKeyhole size={32} className={mktgStyles.featureIcon} />
                    <h3>SLA & Compliance</h3>
                    <p>99.999% uptime guarantee backed by SOC2 Type II and ISO 27001 data-handling procedures.</p>
                </div>
            </div>
        </main>
    );
}
