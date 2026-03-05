import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Server, Shield, Globe, Cpu, Database, Activity } from 'lucide-react';

export default function Platform() {
    return (
        <main className={styles.mainContainer}>
            <div className={mktgStyles.marketingHero}>
                <div className={mktgStyles.marketingBadge}>VPA Enterprise Network</div>
                <h1 className={mktgStyles.marketingTitle}>The global platform for <br />immutable verification.</h1>
                <p className={mktgStyles.marketingSubtitle}>
                    Built on zero-trust architecture, the VPA Central Registry ensures that high-value assets and their digital certificates remain intrinsically linked forever.
                </p>
                <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', margin: '0 auto', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} /> Return to Portal
                </Link>
            </div>

            <div className={mktgStyles.marketingSection}>
                <div className={mktgStyles.imageMockup}>
                    <Image
                        src="/mockups/platform.png"
                        alt="VPA Platform Dashboard"
                        width={800}
                        height={600}
                        layout="responsive"
                    />
                </div>
                <div>
                    <h2 className={mktgStyles.marketingTitle} style={{ fontSize: '2.5rem', textAlign: 'left' }}>Sub-millisecond latency. <br />Decentralized proof.</h2>
                    <p className={mktgStyles.marketingSubtitle} style={{ textAlign: 'left', margin: '1.5rem 0' }}>
                        Our infrastructure is designed for extreme scale. By utilizing a distributed validator network across 14 sovereign jurisdictions, VPA provides 100% uptime for authentication lookups.
                    </p>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <Cpu className={mktgStyles.featureIcon} size={24} />
                            <div>
                                <strong style={{ display: 'block' }}>Hardware-Level Trust</strong>
                                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Secure Enclave (TEE) backed computation for zero-leakage operations.</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <Activity className={mktgStyles.featureIcon} size={24} />
                            <div>
                                <strong style={{ display: 'block' }}>Real-time Audit Logs</strong>
                                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Every query is timestamped and signed by the node operator.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={mktgStyles.marketingFeatures}>
                <div className={mktgStyles.featureBlock}>
                    <Server size={32} className={mktgStyles.featureIcon} />
                    <h3>Distributed Ledger</h3>
                    <p>Certificates are hashed and stored across a fully redundant global network, preventing single-points of failure or tampering.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <Shield size={32} className={mktgStyles.featureIcon} />
                    <h3>Zero-Knowledge Proofs</h3>
                    <p>Authentication lookups do not expose sensitive manufacturer data. Cryptographic hashing confirms authenticity blindly.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <Globe size={32} className={mktgStyles.featureIcon} />
                    <h3>Anywhere Verification</h3>
                    <p>With edge-networking, authoritative queries return in under 50ms from anywhere in the world.</p>
                </div>
            </div>
        </main>
    );
}
