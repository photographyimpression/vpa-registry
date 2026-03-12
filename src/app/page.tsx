"use client";

import { useEffect, useRef } from 'react';
import SearchPortal from '@/components/SearchPortal';
import TrustStory from '@/components/TrustStory';
import { ShieldCheck, Lock, Globe, Zap } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  const bentoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY;
      document.documentElement.style.setProperty('--scroll-y', `${scroll}px`);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealVisible);
        }
      });
    }, { threshold: 0.1 });

    const revealedElements = document.querySelectorAll(`.${styles.reveal}`);
    revealedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bentoRef.current) return;
      const cards = bentoRef.current.querySelectorAll(`.${styles.bentoCard}`);
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);

        // 3D Tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className={styles.mainContainer}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeHighlight}>New</span>
            <span>VPA Registry — Now accepting partners</span>
          </div>
          <h1 className={`${styles.heroTitle} ${styles.reveal}`}>
            The global standard in <br />
            <span className={styles.gradientText}>product authenticity.</span>
          </h1>
          <p className={`${styles.heroSubtitle} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }}>
            Verify cryptographic certificates instantly. Protect your high-end brand, build institutional trust, and defeat counterfeits with our immutable ledger.
          </p>

          <div className={styles.searchContainer}>
            <SearchPortal />
          </div>

          <div className={styles.scrollIndicator}>
            <span>SCROLL TO EXPLORE</span>
            <div className={styles.mouse}>
              <div className={styles.wheel}></div>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={`${styles.glassMockup} ${styles.reveal}`} style={{ transitionDelay: '0.4s' }}>
            <div className={styles.glareEffect}></div>
            <div className={styles.mockupHeader}>
              <div className={styles.dots}>
                <span></span><span></span><span></span>
              </div>
              <div className={styles.urlBar}>vparegistry.com/verify</div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockSkeletonImage}></div>
              <div className={styles.mockSkeletonText}></div>
              <div className={styles.mockSkeletonTextShort}></div>
              <div className={styles.mockStamp}>VERIFIED</div>
            </div>
          </div>
        </div>
      </section>

      <TrustStory />

      <section className={styles.featuresSection}>
        <div className={styles.featureBento} ref={bentoRef}>
          <div className={`${styles.bentoCard} ${styles.bentoLarge} ${styles.reveal}`}>
            <Lock size={32} className={styles.featureIcon} />
            <h3>Cryptographic Proof</h3>
            <p>Every certificate is cryptographically sealed and logged into an immutable master ledger.</p>
          </div>
          <div className={`${styles.bentoCard} ${styles.reveal}`} style={{ transitionDelay: '0.1s' }}>
            <Zap size={32} className={styles.featureIcon} />
            <h3>Instant Verification</h3>
            <p>Scan any VPA QR code to instantly confirm a product&apos;s authenticity against our central registry.</p>
          </div>
          <div className={`${styles.featureCard} ${styles.reveal}`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.featureIcon}>
              <Globe size={24} />
            </div>
            <h3>Global Registry</h3>
            <p>Certificates are publicly verifiable by anyone, anywhere — giving buyers confidence regardless of where they shop.</p>
          </div>

          <div className={`${styles.featureCard} ${styles.trustCard} ${styles.reveal}`} style={{ transitionDelay: '0.3s' }}>
            <div className={styles.featureIcon} style={{ background: 'var(--accent-light)' }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Partner-Only Issuance</h3>
            <p>Only verified brand partners can issue certificates, ensuring every VPA ID traces back to a legitimate source.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
