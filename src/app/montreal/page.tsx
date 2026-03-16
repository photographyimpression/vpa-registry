"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, QrCode, Smartphone, Package, Clock, Sparkles, ArrowRight } from 'lucide-react';
import styles from './Montreal.module.css';

export default function MontrealPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealVisible);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll(`.${styles.reveal}`);
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      {/* ─── HERO ─── */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeHighlight}>Montreal</span>
          <span>Exclusive Launch</span>
        </div>

        <h1 className={styles.heroTitle}>
          Stop Losing Sales to{' '}
          <span className={styles.gradientText}>Doubt</span>
        </h1>

        <p className={styles.heroSub}>
          Give your customers instant cryptographic proof of authenticity. One QR scan. Zero questions.
        </p>

        <div className={styles.promoBox}>
          <div className={styles.spotsLabel}>Only 90 Free Spots for Montreal Resellers</div>
          <div className={styles.codeLabel}>Use this code at signup:</div>
          <div className={styles.promoCode}>MONTREAL90</div>
          <div className={styles.promoNote}>Free tier: 50 certificates/month. No credit card required.</div>
        </div>

        <Link href="/register" className={styles.ctaBtn}>
          Claim Your Free Account <ArrowRight size={18} />
        </Link>

        <div className={styles.progressWrap}>
          <div className={styles.progressLabel}>
            <span>65 of 90 spots claimed</span>
            <span>28% remaining</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className={styles.howSection}>
        <h2 className={`${styles.sectionTitle} ${styles.reveal}`}>Authentication in 3 Steps</h2>
        <p className={`${styles.sectionSub} ${styles.reveal}`}>
          No hardware. No blockchain expertise. No manufacturing changes. Just proof.
        </p>

        <div className={styles.steps}>
          <div className={`${styles.step} ${styles.reveal}`}>
            <div className={styles.stepNum}>1</div>
            <h3>Issue a Certificate</h3>
            <p>Upload your product details and photo. VPA generates a unique cryptographic certificate in seconds.</p>
          </div>
          <div className={`${styles.step} ${styles.reveal}`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.stepNum}>2</div>
            <h3>Share the QR Code</h3>
            <p>Print it, add it to listings, or include it in packaging. Each code links to your product&apos;s verified identity.</p>
          </div>
          <div className={`${styles.step} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.stepNum}>3</div>
            <h3>Customers Verify</h3>
            <p>One scan from any phone. Instant confirmation. No app downloads needed. Trust, delivered.</p>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div>
            <div className={styles.statNum}>47%</div>
            <div className={styles.statLabel}>of luxury buyers worry about fakes when buying online</div>
          </div>
          <div>
            <div className={styles.statNum}>34%</div>
            <div className={styles.statLabel}>faster sales for authenticated luxury items</div>
          </div>
          <div>
            <div className={styles.statNum}>$450B</div>
            <div className={styles.statLabel}>lost to fashion counterfeiting annually worldwide</div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className={styles.benefitsSection}>
        <h2 className={`${styles.sectionTitle} ${styles.reveal}`} style={{ marginBottom: '3rem' }}>
          Built for Montreal Resellers
        </h2>

        <div className={styles.benefitsGrid}>
          <div className={`${styles.benefit} ${styles.reveal}`}>
            <div className={styles.benefitIcon}><ShieldCheck size={22} /></div>
            <h3>Eliminate &ldquo;Is It Real?&rdquo; Questions</h3>
            <p>Customers verify authenticity before they message you. Fewer questions, faster sales, less back-and-forth on every listing.</p>
          </div>
          <div className={`${styles.benefit} ${styles.reveal}`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.benefitIcon}><Package size={22} /></div>
            <h3>Works With Your Existing Inventory</h3>
            <p>No tags to sew in. No chips to embed. Issue certificates for items you already have in stock &mdash; handbags, watches, clothing, jewelry.</p>
          </div>
          <div className={`${styles.benefit} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.benefitIcon}><Clock size={22} /></div>
            <h3>Set Up in 5 Minutes</h3>
            <p>Sign up, enter your business name, issue your first certificate. Self-service. No calls. No demos. No waiting for approval.</p>
          </div>
          <div className={`${styles.benefit} ${styles.reveal}`} style={{ transitionDelay: '0.3s' }}>
            <div className={styles.benefitIcon}><Sparkles size={22} /></div>
            <h3>Free for 90 Montreal Businesses</h3>
            <p>50 certificates/month at no cost. No credit card. No commitment. Use code MONTREAL90 at signup and start authenticating today.</p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className={styles.finalCta}>
        <h2>Your Competitors Are Already Signing Up</h2>
        <p>
          Montreal&apos;s luxury resellers are moving to verified authentication. Don&apos;t be the last one your customers can&apos;t trust.
        </p>
        <Link href="/register" className={styles.ctaBtnLight}>
          Claim Your Free Spot &mdash; Use Code MONTREAL90 <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
