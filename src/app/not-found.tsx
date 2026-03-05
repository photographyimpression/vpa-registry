import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Search } from 'lucide-react';
import styles from './Home.module.css';

export default function NotFound() {
    return (
        <main className={styles.mainContainer} style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem' }}>
            <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--accent-light)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-color)',
                    marginBottom: '1rem'
                }}>
                    <ShieldAlert size={40} />
                </div>

                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', margin: 0 }}>Registry Error 404</h1>
                <p style={{ opacity: 0.6, fontSize: '1.1rem', lineHeight: '1.6' }}>
                    The entry you are looking for does not exist in the VPA Central Registry ledger or has been migrated to a legacy archive.
                </p>

                <div style={{ width: '100%', padding: '1.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
                    <Search size={18} opacity={0.4} />
                    <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Try searching by Registry ID...</span>
                </div>

                <Link href="/" className="magnetic" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'var(--foreground)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '100px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    marginTop: '1rem'
                }}>
                    <ArrowLeft size={18} /> Return to Verification Portal
                </Link>
            </div>
        </main>
    );
}
