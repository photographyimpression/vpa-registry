import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | VPA Central Registry',
    description: 'How VPA Central Registry collects, uses, and protects your personal data.',
};

export default function PrivacyPolicy() {
    const lastUpdated = '11 March 2026';

    return (
        <main className={styles.mainContainer}>
            <div className={mktgStyles.marketingHero}>
                <div className={mktgStyles.marketingBadge}>
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Legal
                </div>
                <h1 className={mktgStyles.marketingTitle} style={{ fontSize: '2.8rem' }}>Privacy Policy</h1>
                <p className={mktgStyles.marketingSubtitle} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Last updated: {lastUpdated}
                </p>
                <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', margin: '1.5rem auto 0', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} /> Return to Registry
                </Link>
            </div>

            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 6rem', lineHeight: '1.8', color: 'var(--foreground)' }}>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>1. Who We Are</h2>
                    <p style={{ opacity: 0.8 }}>
                        VPA Central Registry ("VPA", "we", "our", or "us") operates the product authenticity certification platform available at vparegistry.com. We issue cryptographic certificates that link product photographs to a verified identity on our public registry.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        For the purposes of applicable data protection law, including the UK GDPR, EU GDPR, and California Consumer Privacy Act (CCPA), VPA Central Registry is the data controller for personal data collected through our platform.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>2. Data We Collect</h2>
                    <p style={{ opacity: 0.8 }}>We collect the following categories of personal data:</p>
                    <ul style={{ opacity: 0.8, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <li><strong>Account information:</strong> Name, email address, organisation name, and profile picture collected when you sign in via Google OAuth.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Certificate data:</strong> Product names, batch IDs, and product photographs you upload for certification.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Usage data:</strong> Pages visited, features used, IP address, browser type, and timestamps, collected automatically via server logs.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Communications:</strong> Any correspondence you send to us via email or contact forms.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>3. How We Use Your Data</h2>
                    <p style={{ opacity: 0.8 }}>We process your personal data for the following purposes:</p>
                    <ul style={{ opacity: 0.8, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <li><strong>Service provision:</strong> To create and manage your partner account, issue certificates, and operate the public verification registry.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorised access.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Communications:</strong> To send service-related notifications, respond to your enquiries, and provide customer support.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Legal obligations:</strong> To comply with applicable laws and respond to lawful requests from public authorities.</li>
                    </ul>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        Our legal basis for processing under GDPR is: <em>performance of a contract</em> (service provision); <em>legitimate interests</em> (security and fraud prevention); and <em>compliance with legal obligations</em>.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>4. Public Registry Data</h2>
                    <p style={{ opacity: 0.8 }}>
                        Certificate records — including the VPA Tracking ID, issuance date, manufacturer name, product name, and certified images — are stored on our public registry and accessible to anyone who scans a QR code or searches the registry. By submitting a product for certification, you consent to this public disclosure. Do not submit information you wish to keep confidential.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>5. Data Sharing</h2>
                    <p style={{ opacity: 0.8 }}>We do not sell your personal data. We may share your data with:</p>
                    <ul style={{ opacity: 0.8, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <li><strong>Google LLC:</strong> For authentication (Google OAuth) and data storage (Google Sheets), subject to Google's privacy policy.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Google Cloud Platform:</strong> Our hosting and infrastructure provider.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>n8n:</strong> Our workflow automation provider, used to process certification requests.</li>
                        <li style={{ marginTop: '0.5rem' }}><strong>Law enforcement:</strong> When required by law or to protect our legal rights.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>6. International Transfers</h2>
                    <p style={{ opacity: 0.8 }}>
                        Our services are operated globally. Your data may be transferred to and processed in countries outside your own, including the United States. Where required, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission, or equivalent transfer mechanisms, to protect your data.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>7. Data Retention</h2>
                    <p style={{ opacity: 0.8 }}>
                        We retain your account data for as long as your account is active. Certificate records on the public registry are retained indefinitely to preserve the integrity of the verification system. Usage logs are retained for up to 90 days. You may request deletion of your account data (excluding public certificate records) at any time.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>8. Your Rights</h2>
                    <p style={{ opacity: 0.8 }}>Depending on your jurisdiction, you may have the right to:</p>
                    <ul style={{ opacity: 0.8, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <li>Access the personal data we hold about you</li>
                        <li style={{ marginTop: '0.5rem' }}>Correct inaccurate data</li>
                        <li style={{ marginTop: '0.5rem' }}>Request deletion of your personal data</li>
                        <li style={{ marginTop: '0.5rem' }}>Object to or restrict our processing of your data</li>
                        <li style={{ marginTop: '0.5rem' }}>Data portability (receiving your data in a machine-readable format)</li>
                        <li style={{ marginTop: '0.5rem' }}>Withdraw consent at any time where processing is based on consent</li>
                        <li style={{ marginTop: '0.5rem' }}>Lodge a complaint with your national supervisory authority (e.g. the ICO in the UK, or your EU member state's DPA)</li>
                    </ul>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        To exercise any of these rights, contact us at <strong>privacy@vparegistry.com</strong>.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>9. Cookies</h2>
                    <p style={{ opacity: 0.8 }}>
                        We use essential cookies to maintain your login session. We do not use advertising or tracking cookies. For more detail, see our <Link href="/cookies" style={{ color: 'var(--accent-color)' }}>Cookie Policy</Link>.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>10. Contact Us</h2>
                    <p style={{ opacity: 0.8 }}>
                        For any privacy-related questions or to exercise your rights, contact our Data Protection team at:<br />
                        <strong>privacy@vparegistry.com</strong>
                    </p>
                </section>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', opacity: 0.5, fontSize: '0.85rem' }}>
                    <p>This policy was last updated on {lastUpdated}. We may update this policy periodically. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
                </div>
            </div>
        </main>
    );
}
