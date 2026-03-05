"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ShoppingCart, ShieldCheck, Heart } from 'lucide-react';
import styles from './TrustStory.module.css';

const storySteps = [
    {
        badge: "01. THE PROBLEM",
        title: "Abandoned Confidence",
        description: "78% of consumers abandon luxury purchases when they cannot verify the authenticity of the product imagery.",
        icon: <ShoppingCart size={24} />,
        image: "/story/problem.png",
        alt: "Skeptical Consumer"
    },
    {
        badge: "02. THE SOLUTION",
        title: "Cryptographic Trust",
        description: "VPA's open registry allows brands to seal product photos at source, creating an unbreakable link between pixels and reality.",
        icon: <ShieldCheck size={24} />,
        image: "/story/solution.png",
        alt: "Sealed Image Protocol"
    },
    {
        badge: "03. THE OUTCOME",
        title: "Unmatched Loyalty",
        description: "Brands using the VPA protocol see a 42% increase in customer lifetime value through verified ownership and provenance.",
        icon: <Heart size={24} />,
        image: "/story/outcome.png",
        alt: "Verified Owner Experience"
    }
];

const partners = [
    "Luxora", "SecureFab", "AuthNet", "GlobalVera", "ChainTrace", "TrustSeal", "OriginCheck", "PurePath"
];

export default function TrustStory() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.storyStepVisible);
                }
            });
        }, { threshold: 0.2 });

        const steps = sectionRef.current?.querySelectorAll(`.${styles.storyStep}`);
        steps?.forEach(step => observer.observe(step));

        return () => observer.disconnect();
    }, []);

    return (
        <section className={styles.storySection} ref={sectionRef}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Why <span>Trust Matters</span>
                    </h2>
                    <p className={styles.description}>
                        In an era of generative AI and synthetic media, the truth is your most valuable asset.
                    </p>
                </div>

                <div className={styles.storyGrid}>
                    {storySteps.map((step, index) => (
                        <div key={index} className={styles.storyStep}>
                            <div className={styles.visualWrapper}>
                                <Image
                                    src={step.image}
                                    alt={step.alt}
                                    width={600}
                                    height={400}
                                    className={styles.storyImage}
                                />
                                <div className={styles.stepBadge}>{step.badge}</div>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.iconCircle}>
                                    {step.icon}
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>

                                {index < storySteps.length - 1 && (
                                    <div className={styles.connector}>
                                        <svg width="2" height="100" viewBox="0 0 2 100">
                                            <line x1="1" y1="0" x2="1" y2="100" stroke="var(--accent-color)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.partnerMarquee}>
                    <div className={styles.marqueeHeader}>TRUSTED BY GLOBAL INSTITUTIONS</div>
                    <div className="marqueeContainer">
                        <div className="marqueeContent">
                            {partners.map((p, i) => (
                                <span key={i} className={styles.partnerName}>{p}</span>
                            ))}
                            {/* Duplicate for infinite feel */}
                            {partners.map((p, i) => (
                                <span key={`dup-${i}`} className={styles.partnerName}>{p}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
