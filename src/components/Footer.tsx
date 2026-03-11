import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.footerBrand}>
                    <div className={styles.logoRow}>
                        <Image
                            src="/vpa-logo.jpg"
                            alt="VPA Logo"
                            width={32}
                            height={32}
                            className={styles.footerLogoGraphic}
                        />
                        <span className={styles.footerBrandText}>VPA Registry</span>
                    </div>
                    <p className={styles.footerTagline}>
                        The global cryptographic standard for <br /> product authenticity verification.
                    </p>
                    <div className={styles.newsletter}>
                        <h5>Stay Authenticated</h5>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>Updates on new features and platform news coming soon.</p>
                    </div>
                </div>

                <div className={styles.footerLinksGrid}>
                    <div className={styles.footerColumn}>
                        <h4>Platform</h4>
                        <Link href="/platform">Infrastructure</Link>
                        <Link href="/solutions">Solutions</Link>
                        <Link href="/verification">Verification</Link>
                    </div>
                    <div className={styles.footerColumn}>
                        <h4>Enterprise</h4>
                        <Link href="/enterprise">Solutions</Link>
                        <Link href="/register">Request Access</Link>
                        <Link href="/login">Partner Portal</Link>
                    </div>
                    <div className={styles.footerColumn}>
                        <h4>Governance</h4>
                        <Link href="/platform">Infrastructure</Link>
                        <Link href="/solutions">Industry Solutions</Link>
                        <Link href="/verification">Verify a Certificate</Link>
                    </div>
                    <div className={styles.footerColumn}>
                        <h4>Legal</h4>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms of Service</Link>
                        <Link href="/cookies">Cookie Policy</Link>
                    </div>
                </div>
            </div>

            <div className={styles.nodeMarquee}>
                <div className="marqueeContainer">
                    <div className="marqueeContent">
                        <span>ZURICH (CH-01)</span>
                        <span>SINGAPORE (SG-04)</span>
                        <span>NEW YORK (US-ER)</span>
                        <span>LONDON (UK-LD)</span>
                        <span>TOKYO (JP-TK)</span>
                        <span>DUBAI (UAE-DX)</span>
                        <span>ZURICH (CH-01)</span>
                        <span>SINGAPORE (SG-04)</span>
                        <span>NEW YORK (US-ER)</span>
                        <span>LONDON (UK-LD)</span>
                        <span>TOKYO (JP-TK)</span>
                        <span>DUBAI (UAE-DX)</span>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className={styles.footerBottomContainer}>
                    <div className={styles.statusIndicator}>
                        <div className={styles.pulseDot}></div>
                        <span>VPA NETWORK: OPERATIONAL</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} VPA Central Registry. All Rights Reserved.</p>
                    <div className={styles.footerStatus}>
                        <span className={styles.statusDot}></span> System Status: Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
