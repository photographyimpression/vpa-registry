"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, User, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        // eslint-disable-next-line
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav
            ref={navRef}
            className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''} ${mobileMenuOpen ? styles.navbarMobileOpen : ''}`}
        >
            <div className={styles.container}>
                <Link href="/" className={styles.navLogo}>
                    <ShieldCheck color="var(--accent-color)" size={32} />
                    <span className={styles.brandText}>VPA <span>REGISTRY</span></span>
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/solutions" className={pathname === '/solutions' ? styles.active : ''}>Solutions</Link>
                    <Link href="/platform" className={pathname === '/platform' ? styles.active : ''}>Platform</Link>
                    <Link href="/enterprise" className={pathname === '/enterprise' ? styles.active : ''}>Enterprise</Link>
                    <Link href="/pricing" className={pathname === '/pricing' ? styles.active : ''}>Pricing</Link>
                    <Link href="/verification" className={pathname === '/verification' ? styles.active : ''}>Verification</Link>
                </div>

                <div className={styles.navActions}>
                    <Link href="/login" className={`${styles.loginBtn} magnetic`}>
                        <User size={18} strokeWidth={1.5} />
                        Partner Login
                    </Link>
                    <Link href="/dashboard/issuance" className={`${styles.ctaBtn} magnetic`}>
                        Issue Certificate
                    </Link>
                </div>

                <button
                    className={styles.mobileToggle}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            <div className={styles.mobileOverlay}>
                <div className={styles.mobileNav}>
                    <Link href="/solutions">Solutions</Link>
                    <Link href="/platform">Platform</Link>
                    <Link href="/enterprise">Enterprise</Link>
                    <Link href="/pricing">Pricing</Link>
                    <Link href="/verification">Verification</Link>
                    <div className={styles.mobileDivider}></div>
                    <Link href="/login" className={styles.mobileAction}>Partner Login</Link>
                    <Link href="/dashboard/issuance" className={styles.mobileActionPrimary}>Issue Certificate</Link>
                </div>
            </div>
        </nav>
    );
}
