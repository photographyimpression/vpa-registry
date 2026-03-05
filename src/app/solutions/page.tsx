import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shirt, Watch, Component, CheckCircle2, QrCode, Tag } from 'lucide-react';

export default function Solutions() {
    return (
        <main className={styles.mainContainer}>
            <div className={mktgStyles.marketingHero}>
                <div className={mktgStyles.marketingBadge}>Industry Solutions</div>
                <h1 className={mktgStyles.marketingTitle}>Protecting every standard.</h1>
                <p className={mktgStyles.marketingSubtitle}>
                    From high-end fashion to heavy machinery, VPA customizes digital workflows that secure brand equity for every supply chain format.
                </p>
                <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', margin: '0 auto', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} /> Return to Portal
                </Link>
            </div>

            <div className={mktgStyles.marketingSection}>
                <div>
                    <h2 className={mktgStyles.marketingTitle} style={{ fontSize: '2.5rem', textAlign: 'left' }}>Seamless physical-to-digital linking.</h2>
                    <p className={mktgStyles.marketingSubtitle} style={{ textAlign: 'left', margin: '1.5rem 0' }}>
                        VPA doesn't just provide software; we provide the bridge. Our cryptographic tagging solutions ensure that the physical object cannot be decoupled from its digital twin.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '1rem' }}>
                        <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', opacity: 0.8 }}>
                            <CheckCircle2 size={18} color="var(--accent-color)" /> Tamper-evident NFC implementation
                        </li>
                        <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', opacity: 0.8 }}>
                            <CheckCircle2 size={18} color="var(--accent-color)" /> Laser-etched invisible micro-marks
                        </li>
                        <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', opacity: 0.8 }}>
                            <CheckCircle2 size={18} color="var(--accent-color)" /> Dynamic QR rotation for retail verification
                        </li>
                    </ul>
                </div>
                <div className={mktgStyles.imageMockup}>
                    <Image
                        src="/mockups/solutions.png"
                        alt="VPA Industry Solutions"
                        width={800}
                        height={600}
                        layout="responsive"
                    />
                </div>
            </div>

            <div className={mktgStyles.marketingFeatures}>
                <div className={mktgStyles.featureBlock}>
                    <Shirt size={32} className={mktgStyles.featureIcon} />
                    <h3>Haute Couture</h3>
                    <p>Embed tamper-evident NFC threads into garments that automatically link back to our central digital certificate registry.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <Watch size={32} className={mktgStyles.featureIcon} />
                    <h3>Luxury Timepieces</h3>
                    <p>Transferable ownership ledgers ensure that pre-owned luxury markets remain pristine and free of high-fidelity counterfeits.</p>
                </div>
                <div className={mktgStyles.featureBlock}>
                    <Component size={32} className={mktgStyles.featureIcon} />
                    <h3>Industrial Parts</h3>
                    <p>Verify safety-critical aeronautics and medical components to ensure 100% compliance with government manufacturing acts.</p>
                </div>
            </div>
        </main>
    );
}
