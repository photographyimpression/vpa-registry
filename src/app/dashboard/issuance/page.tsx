"use client";

import { useState, useRef } from 'react';
import { Upload, Edit3, ShieldCheck, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import styles from '../Dashboard.module.css';

export default function IssuancePage() {
    const [step, setStep] = useState(1);
    const [isSealing, setIsSealing] = useState(false);
    const [generatedId, setGeneratedId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setStep(2);
        }
    };

    const triggerFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleIssue = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSealing(true);

        // Simulate cryptographic sealing process
        setTimeout(() => {
            const newId = `VPA-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            setGeneratedId(newId);
            setIsSealing(false);
            setStep(3);
        }, 2000);
    };

    return (
        <div className={styles.panel} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header className={styles.panelHeader} style={{ textAlign: 'center', flexDirection: 'column', gap: '1rem' }}>
                <h2 className={styles.panelTitle}>Certificate Issuance Protocol</h2>
                <p className={styles.dashboardSubtitle}>Follow the steps to cryptographically seal a new product photo.</p>
            </header>

            <div className={styles.stepper}>
                <div className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`}>
                    <Upload size={20} style={{ marginBottom: '8px' }} />
                    <div>UPLOAD</div>
                </div>
                <div className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}>
                    <Edit3 size={20} style={{ marginBottom: '8px' }} />
                    <div>METADATA</div>
                </div>
                <div className={`${styles.step} ${step === 3 ? styles.stepActive : ''}`}>
                    <ShieldCheck size={20} style={{ marginBottom: '8px' }} />
                    <div>SEAL</div>
                </div>
            </div>

            {step === 1 && (
                <div className={styles.issuanceContent}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".dzi,.jpg,.png,.xml"
                        onChange={handleFileSelect}
                    />
                    <div className={styles.uploadArea}>
                        <Upload size={48} opacity={0.2} />
                        <p>Drag and drop high-resolution product photo</p>
                        <span>Supports .DZI, .JPG, .PNG (Max 50MB)</span>
                        <button className={styles.browseBtn} onClick={triggerFilePicker}>Browse Files</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className={styles.issuanceContent}>
                    <form className={styles.issuanceForm} onSubmit={handleIssue}>
                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input type="text" placeholder="e.g. Luxora Limited Edition A1" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Manufacturer Batch ID</label>
                            <input type="text" placeholder="BATCH-2024-X1" required />
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Material Quality</label>
                                <select>
                                    <option>Grade A Titanium</option>
                                    <option>Premium Leather</option>
                                    <option>Sapphire Crystal</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Jurisdiction</label>
                                <input type="text" value="Switzerland / Global" disabled />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={styles.actionBtnPrimary}
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={isSealing}
                        >
                            {isSealing ? (
                                <><Loader2 className="animate-spin" size={18} /> Sealing Ledger...</>
                            ) : (
                                <>Generate Cryptographic Proof <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div className={styles.issuanceContent} style={{ textAlign: 'center' }}>
                    <div className={styles.successCircle}>
                        <CheckCircle size={64} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Registry Entry Confirmed</h3>
                    <p className={styles.dashboardSubtitle} style={{ marginBottom: '2rem' }}>
                        The image has been sealed with ID: <strong style={{ color: 'var(--foreground)' }}>{generatedId}</strong>.
                        It is now discoverable on the global ledger.
                    </p>
                    <div className={styles.actionGrid}>
                        <button className={styles.browseBtn} onClick={() => setStep(1)}>Issue Another</button>
                        <button className={styles.actionBtnPrimary}>View Certificate</button>
                    </div>
                </div>
            )}
        </div>
    );
}
