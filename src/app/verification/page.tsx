import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import SearchPortal from '@/components/SearchPortal';

export default function Verification() {
    return (
        <main className={styles.mainContainer} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.glassVault} style={{ maxWidth: '700px', padding: '5rem 4rem', width: '100%' }}>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <ShieldCheck size={56} className={mktgStyles.featureIcon} style={{ margin: '0 auto 1.5rem', background: 'transparent' }} />
                    <h1 className={mktgStyles.marketingTitle} style={{ fontSize: '3rem', marginBottom: '1rem' }}>Global Verification</h1>
                    <p className={mktgStyles.marketingSubtitle} style={{ marginBottom: 0 }}>
                        Enter a VPA Cryptographic Certificate ID below to query the immutable ledger.
                    </p>
                </div>

                <div style={{ width: '100%', marginBottom: '4rem' }}>
                    <SearchPortal />
                </div>

                <div style={{ borderTop: `1px solid var(--border-color)`, paddingTop: '2rem', textAlign: 'center' }}>
                    <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                        <ArrowLeft size={16} /> Return Home
                    </Link>
                </div>

            </div>
        </main>
    );
}
