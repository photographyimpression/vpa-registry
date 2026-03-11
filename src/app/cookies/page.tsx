import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';

export const metadata = {
    title: 'Cookie Policy | VPA Central Registry',
    description: 'How VPA Central Registry uses cookies and similar technologies.',
};

export default function CookiePolicy() {
    const lastUpdated = '11 March 2026';

    return (
        <main className={styles.mainContainer}>
            <div className={mktgStyles.marketingHero}>
                <div className={mktgStyles.marketingBadge}>
                    <Cookie size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Legal
                </div>
                <h1 className={mktgStyles.marketingTitle} style={{ fontSize: '2.8rem' }}>Cookie Policy</h1>
                <p className={mktgStyles.marketingSubtitle} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Last updated: {lastUpdated}
                </p>
                <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', margin: '1.5rem auto 0', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} /> Return to Registry
                </Link>
            </div>

            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 6rem', lineHeight: '1.8', color: 'var(--foreground)' }}>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>What Are Cookies?</h2>
                    <p style={{ opacity: 0.8 }}>
                        Cookies are small text files stored on your device by your web browser when you visit a website. They allow websites to recognise your device across pages and visits. This policy explains how VPA Central Registry uses cookies and how you can control them.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Cookies We Use</h2>
                    <p style={{ opacity: 0.8 }}>We use only <strong>essential cookies</strong> that are strictly necessary to operate the platform:</p>

                    <div style={{ marginTop: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', opacity: 0.6 }}>Cookie Name</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', opacity: 0.6 }}>Purpose</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', opacity: 0.6 }}>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>authjs.session-token</td>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', opacity: 0.8 }}>Maintains your authenticated login session</td>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', opacity: 0.8 }}>30 days</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>authjs.csrf-token</td>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', opacity: 0.8 }}>Prevents cross-site request forgery attacks</td>
                                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', opacity: 0.8 }}>Session</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>vpa_cookie_consent</td>
                                    <td style={{ padding: '0.75rem 1rem', opacity: 0.8 }}>Records your cookie consent preference</td>
                                    <td style={{ padding: '0.75rem 1rem', opacity: 0.8 }}>1 year</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p style={{ opacity: 0.8, marginTop: '1.5rem' }}>
                        We do <strong>not</strong> use advertising cookies, tracking cookies, or third-party analytics cookies.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Third-Party Cookies</h2>
                    <p style={{ opacity: 0.8 }}>
                        When you sign in using Google OAuth, Google may set its own cookies governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Google's Privacy Policy</a>. We have no control over these cookies.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Managing Cookies</h2>
                    <p style={{ opacity: 0.8 }}>
                        You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing ones. Note that disabling essential cookies will prevent you from logging into the partner portal — the public verification registry remains accessible without cookies.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>For guidance on managing cookies in your browser:</p>
                    <ul style={{ opacity: 0.8, paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Google Chrome</a></li>
                        <li style={{ marginTop: '0.25rem' }}><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Mozilla Firefox</a></li>
                        <li style={{ marginTop: '0.25rem' }}><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Apple Safari</a></li>
                        <li style={{ marginTop: '0.25rem' }}><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Microsoft Edge</a></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Contact</h2>
                    <p style={{ opacity: 0.8 }}>
                        Questions about our use of cookies? Contact us at <strong>privacy@vparegistry.com</strong>.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        See also our <Link href="/privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</Link> and <Link href="/terms" style={{ color: 'var(--accent-color)' }}>Terms of Service</Link>.
                    </p>
                </section>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', opacity: 0.5, fontSize: '0.85rem' }}>
                    <p>This policy was last updated on {lastUpdated}.</p>
                </div>
            </div>
        </main>
    );
}
