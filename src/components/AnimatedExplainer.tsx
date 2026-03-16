"use client";

import { useEffect, useState, useRef } from 'react';
import { Camera, ShieldCheck, ScanLine, CheckCircle2, FileImage, Hash, QrCode, Fingerprint } from 'lucide-react';
import styles from './AnimatedExplainer.module.css';

const SCENE_DURATION = 4000; // ms per scene
const TOTAL_SCENES = 3;

export default function AnimatedExplainer() {
    const [activeScene, setActiveScene] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startPlaying = () => {
        setIsPlaying(true);
        setActiveScene(0);
    };

    useEffect(() => {
        if (!isPlaying) return;

        intervalRef.current = setInterval(() => {
            setActiveScene(prev => (prev + 1) % TOTAL_SCENES);
        }, SCENE_DURATION);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying]);

    if (!isPlaying) {
        return (
            <button className={styles.frame} onClick={startPlaying} aria-label="Play explainer animation">
                {/* Static preview */}
                <div className={styles.previewBg}>
                    <div className={styles.previewOrb1} />
                    <div className={styles.previewOrb2} />
                    <div className={styles.previewContent}>
                        <div className={styles.previewIcon}>
                            <ShieldCheck size={40} strokeWidth={1.5} />
                        </div>
                        <p className={styles.previewTitle}>How VPA Certification Works</p>
                        <p className={styles.previewSub}>3 steps in 12 seconds</p>
                    </div>
                    <div className={styles.playBtn}>
                        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                            <polygon points="6,3 20,12 6,21" />
                        </svg>
                    </div>
                    <div className={styles.durationBadge}>
                        <span>Watch how it works</span>
                        <span className={styles.dot} />
                        <span>0:12</span>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className={styles.frame}>
            <div className={styles.stage}>
                {/* Progress bar */}
                <div className={styles.progressBar}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className={styles.progressSegment}>
                            <div
                                className={`${styles.progressFill} ${activeScene === i ? styles.progressActive : ''} ${activeScene > i ? styles.progressDone : ''}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Scene label */}
                <div className={styles.sceneLabel}>
                    <span className={styles.sceneBadge}>
                        {activeScene === 0 && 'Step 1 of 3'}
                        {activeScene === 1 && 'Step 2 of 3'}
                        {activeScene === 2 && 'Step 3 of 3'}
                    </span>
                </div>

                {/* ── SCENE 1: Upload & Verify ── */}
                <div className={`${styles.scene} ${activeScene === 0 ? styles.sceneActive : ''}`}>
                    <div className={styles.sceneTitle}>
                        <Camera size={18} />
                        <span>Upload & Verify</span>
                    </div>
                    <div className={styles.uploadScene}>
                        {/* Mock image card */}
                        <div className={styles.imageCard}>
                            <div className={styles.imagePlaceholder}>
                                <FileImage size={32} strokeWidth={1} />
                                <span>product_photo.jpg</span>
                            </div>
                            {/* Scan line animation */}
                            <div className={styles.scanLine} />
                        </div>
                        {/* Metadata checks */}
                        <div className={styles.checkList}>
                            <div className={`${styles.checkItem} ${styles.check1}`}>
                                <Fingerprint size={14} />
                                <span>EXIF metadata intact</span>
                                <CheckCircle2 size={14} className={styles.checkIcon} />
                            </div>
                            <div className={`${styles.checkItem} ${styles.check2}`}>
                                <Hash size={14} />
                                <span>SHA-256 hash computed</span>
                                <CheckCircle2 size={14} className={styles.checkIcon} />
                            </div>
                            <div className={`${styles.checkItem} ${styles.check3}`}>
                                <ShieldCheck size={14} />
                                <span>AI generation: not detected</span>
                                <CheckCircle2 size={14} className={styles.checkIcon} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── SCENE 2: Certify & Seal ── */}
                <div className={`${styles.scene} ${activeScene === 1 ? styles.sceneActive : ''}`}>
                    <div className={styles.sceneTitle}>
                        <ShieldCheck size={18} />
                        <span>Certify & Seal</span>
                    </div>
                    <div className={styles.certifyScene}>
                        <div className={styles.certCard}>
                            <div className={styles.certHeader}>
                                <ShieldCheck size={16} />
                                <span>VPA CERTIFICATE</span>
                            </div>
                            <div className={styles.certBody}>
                                <div className={styles.certRow}>
                                    <span className={styles.certLabel}>Registry ID</span>
                                    <span className={styles.certValue}>
                                        <span className={styles.typewriter}>VPA-XK4MNR-2847</span>
                                    </span>
                                </div>
                                <div className={`${styles.certRow} ${styles.certRow2}`}>
                                    <span className={styles.certLabel}>Status</span>
                                    <span className={styles.certStatus}>VERIFIED</span>
                                </div>
                                <div className={`${styles.certRow} ${styles.certRow3}`}>
                                    <span className={styles.certLabel}>Partner</span>
                                    <span className={styles.certValue}>Luxora International</span>
                                </div>
                            </div>
                            <div className={styles.certQr}>
                                <QrCode size={36} strokeWidth={1} />
                            </div>
                        </div>
                        {/* Stamp overlay */}
                        <div className={styles.stamp}>
                            <ShieldCheck size={24} />
                            <span>CERTIFIED</span>
                        </div>
                    </div>
                </div>

                {/* ── SCENE 3: Scan & Confirm ── */}
                <div className={`${styles.scene} ${activeScene === 2 ? styles.sceneActive : ''}`}>
                    <div className={styles.sceneTitle}>
                        <ScanLine size={18} />
                        <span>Scan & Confirm</span>
                    </div>
                    <div className={styles.verifyScene}>
                        {/* Phone mockup */}
                        <div className={styles.phoneMock}>
                            <div className={styles.phoneNotch} />
                            <div className={styles.phoneScreen}>
                                <div className={styles.phoneHeader}>
                                    <ShieldCheck size={14} />
                                    <span>VPA Registry</span>
                                </div>
                                <div className={styles.phoneResult}>
                                    <div className={styles.phoneCheckmark}>
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <span className={styles.phoneStatus}>VERIFIED AUTHENTIC</span>
                                    <span className={styles.phoneId}>VPA-XK4MNR-2847</span>
                                </div>
                                <div className={styles.phoneDetails}>
                                    <div className={styles.phoneRow}>
                                        <span>Issued</span><span>2026-03-12</span>
                                    </div>
                                    <div className={styles.phoneRow}>
                                        <span>Partner</span><span>Luxora Intl.</span>
                                    </div>
                                    <div className={styles.phoneRow}>
                                        <span>AI Check</span><span>Passed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating badges */}
                        <div className={styles.floatingBadges}>
                            <div className={`${styles.floatBadge} ${styles.float1}`}>
                                <CheckCircle2 size={12} /> Image authentic
                            </div>
                            <div className={`${styles.floatBadge} ${styles.float2}`}>
                                <CheckCircle2 size={12} /> No tampering
                            </div>
                            <div className={`${styles.floatBadge} ${styles.float3}`}>
                                <CheckCircle2 size={12} /> Registered partner
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
