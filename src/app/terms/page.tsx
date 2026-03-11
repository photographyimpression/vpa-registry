import styles from '@/app/Home.module.css';
import mktgStyles from '@/app/Marketing.module.css';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service | VPA Central Registry',
    description: 'The terms and conditions governing use of the VPA Central Registry platform.',
};

export default function TermsOfService() {
    const lastUpdated = '11 March 2026';

    return (
        <main className={styles.mainContainer}>
            <div className={mktgStyles.marketingHero}>
                <div className={mktgStyles.marketingBadge}>
                    <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Legal
                </div>
                <h1 className={mktgStyles.marketingTitle} style={{ fontSize: '2.8rem' }}>Terms of Service</h1>
                <p className={mktgStyles.marketingSubtitle} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Last updated: {lastUpdated}
                </p>
                <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', margin: '1.5rem auto 0', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                    <ArrowLeft size={16} /> Return to Registry
                </Link>
            </div>

            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 6rem', lineHeight: '1.8', color: 'var(--foreground)' }}>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>1. Agreement to Terms</h2>
                    <p style={{ opacity: 0.8 }}>
                        By accessing or using the VPA Central Registry platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Service. These Terms apply to all visitors, partners, and others who access or use the Service.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>2. The Service</h2>
                    <p style={{ opacity: 0.8 }}>
                        VPA Central Registry provides a product authenticity certification service. Partners upload product photographs; we apply a unique VPA Tracking ID, a QR code, and a certification mark, and record the certificate on our public registry. Members of the public can scan QR codes to verify product authenticity.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with reasonable notice where practicable.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>3. Partner Accounts</h2>
                    <p style={{ opacity: 0.8 }}>
                        To use the certification features, you must create a partner account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        You must be at least 18 years old and have the legal authority to enter into this agreement on behalf of your organisation to use the Service.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>4. Acceptable Use</h2>
                    <p style={{ opacity: 0.8 }}>You agree not to:</p>
                    <ul style={{ opacity: 0.8, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
                        <li>Submit photographs of products you do not own or have the right to certify</li>
                        <li style={{ marginTop: '0.5rem' }}>Use the Service to certify counterfeit, illegal, or misleading products</li>
                        <li style={{ marginTop: '0.5rem' }}>Submit edited, retouched, or digitally altered photographs as original product images</li>
                        <li style={{ marginTop: '0.5rem' }}>Attempt to circumvent, disable, or interfere with the security of the Service</li>
                        <li style={{ marginTop: '0.5rem' }}>Use automated scripts or bots to access the Service without our written consent</li>
                        <li style={{ marginTop: '0.5rem' }}>Reproduce or redistribute the VPA certification mark outside of certified images</li>
                        <li style={{ marginTop: '0.5rem' }}>Use the Service in any way that violates applicable local, national, or international law</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>5. Intellectual Property</h2>
                    <p style={{ opacity: 0.8 }}>
                        You retain all ownership rights in the product photographs you submit. By submitting photographs, you grant VPA Central Registry a non-exclusive, worldwide, royalty-free licence to store, display, and distribute those images as part of the public registry for the purpose of operating the Service.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        The VPA name, logo, certification mark, and all platform software are the intellectual property of VPA Central Registry and may not be used without our prior written consent.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>6. Payment and Subscription</h2>
                    <p style={{ opacity: 0.8 }}>
                        Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except where required by applicable law. We reserve the right to change pricing with 30 days' notice. Continued use of the Service after a price change constitutes acceptance of the new pricing.
                    </p>
                    <p style={{ opacity: 0.8, marginTop: '1rem' }}>
                        Failure to pay may result in suspension or termination of your account and deletion of associated data.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>7. Disclaimer of Warranties</h2>
                    <p style={{ opacity: 0.8 }}>
                        The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or completely secure. VPA certification is a tool to support authenticity claims — it does not constitute a legal guarantee of a product's origin, quality, or compliance.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>8. Limitation of Liability</h2>
                    <p style={{ opacity: 0.8 }}>
                        To the fullest extent permitted by law, VPA Central Registry shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability for any claim shall not exceed the amount you paid us in the three months preceding the claim.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>9. Termination</h2>
                    <p style={{ opacity: 0.8 }}>
                        We may suspend or terminate your account at any time for breach of these Terms, fraudulent use, or for any other reason with reasonable notice. Upon termination, your right to access the Service will cease. Public certificate records may remain on the registry to preserve verification integrity.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>10. Governing Law</h2>
                    <p style={{ opacity: 0.8 }}>
                        These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales, except where mandatory local consumer protection laws apply.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>11. Contact</h2>
                    <p style={{ opacity: 0.8 }}>
                        For questions about these Terms, contact us at <strong>legal@vparegistry.com</strong>.
                    </p>
                </section>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', opacity: 0.5, fontSize: '0.85rem' }}>
                    <p>These Terms were last updated on {lastUpdated}. We reserve the right to modify these Terms at any time. Continued use of the Service following notice of changes constitutes acceptance of the revised Terms.</p>
                </div>
            </div>
        </main>
    );
}
