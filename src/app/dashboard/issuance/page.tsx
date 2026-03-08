"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, Edit3, ShieldCheck, CheckCircle, ArrowRight, Loader2, Layers, X, FileImage } from 'lucide-react';
import styles from '../Dashboard.module.css';

type UploadedFile = {
    file: File;
    id: string;
    status: 'pending' | 'sealing' | 'done';
    certId?: string;
};

type Mode = 'single' | 'bulk';

export default function IssuancePage() {
    const [mode, setMode] = useState<Mode>('single');
    const [step, setStep] = useState(1);
    const [isSealing, setIsSealing] = useState(false);
    const [generatedId, setGeneratedId] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Bulk state
    const [bulkFiles, setBulkFiles] = useState<UploadedFile[]>([]);
    const [bulkStep, setBulkStep] = useState<'upload' | 'processing' | 'done'>('upload');

    const singleFileRef = useRef<HTMLInputElement>(null);
    const bulkFileRef = useRef<HTMLInputElement>(null);

    const generateCertId = () =>
        `VPA-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // ---- SINGLE UPLOAD ----
    const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) setStep(2);
    };

    const handleIssue = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSealing(true);
        setTimeout(() => {
            setGeneratedId(generateCertId());
            setIsSealing(false);
            setStep(3);
        }, 2000);
    };

    // ---- BULK UPLOAD ----
    const handleBulkFiles = useCallback((files: FileList) => {
        const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
            file,
            id: Math.random().toString(36).substring(2),
            status: 'pending',
        }));
        setBulkFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleBulkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) handleBulkFiles(e.target.files);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) handleBulkFiles(e.dataTransfer.files);
    };

    const removeBulkFile = (id: string) => {
        setBulkFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const sealAll = async () => {
        if (bulkFiles.length === 0) return;
        setBulkStep('processing');

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        for (let i = 0; i < bulkFiles.length; i++) {
            setBulkFiles((prev) =>
                prev.map((f, idx) => (idx === i ? { ...f, status: 'sealing' } : f))
            );
            await delay(600 + Math.random() * 400);
            setBulkFiles((prev) =>
                prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'done', certId: generateCertId() } : f
                )
            );
        }
        setBulkStep('done');
    };

    const resetBulk = () => {
        setBulkFiles([]);
        setBulkStep('upload');
    };

    const doneCount = bulkFiles.filter((f) => f.status === 'done').length;

    return (
        <div className={styles.panel} style={{ maxWidth: '860px', margin: '0 auto' }}>
            <header className={styles.panelHeader} style={{ textAlign: 'center', flexDirection: 'column', gap: '1rem' }}>
                <h2 className={styles.panelTitle}>Certificate Issuance Protocol</h2>
                <p className={styles.dashboardSubtitle}>Cryptographically seal one or many product photos.</p>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                        id="single-mode-btn"
                        onClick={() => { setMode('single'); setStep(1); }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '100px',
                            border: '1.5px solid',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            borderColor: mode === 'single' ? 'var(--accent-color)' : 'var(--border-color)',
                            background: mode === 'single' ? 'var(--accent-light)' : 'transparent',
                            color: mode === 'single' ? 'var(--accent-color)' : 'var(--foreground)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Single Protocol
                    </button>
                    <button
                        id="bulk-mode-btn"
                        onClick={() => { setMode('bulk'); resetBulk(); }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '100px',
                            border: '1.5px solid',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            borderColor: mode === 'bulk' ? 'var(--accent-color)' : 'var(--border-color)',
                            background: mode === 'bulk' ? 'var(--accent-light)' : 'transparent',
                            color: mode === 'bulk' ? 'var(--accent-color)' : 'var(--foreground)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <Layers size={15} /> Bulk Protocol
                    </button>
                </div>
            </header>

            {/* ===== SINGLE MODE ===== */}
            {mode === 'single' && (
                <>
                    <div className={styles.stepper}>
                        <div className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`}>
                            <Upload size={20} style={{ marginBottom: '8px' }} /><div>UPLOAD</div>
                        </div>
                        <div className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}>
                            <Edit3 size={20} style={{ marginBottom: '8px' }} /><div>METADATA</div>
                        </div>
                        <div className={`${styles.step} ${step === 3 ? styles.stepActive : ''}`}>
                            <ShieldCheck size={20} style={{ marginBottom: '8px' }} /><div>SEAL</div>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className={styles.issuanceContent}>
                            <input type="file" ref={singleFileRef} style={{ display: 'none' }} accept=".dzi,.jpg,.png,.xml" onChange={handleSingleFileSelect} />
                            <div className={styles.uploadArea}>
                                <Upload size={48} opacity={0.2} />
                                <p>Drag and drop high-resolution product photo</p>
                                <span>Supports .DZI, .JPG, .PNG (Max 50MB)</span>
                                <button className={styles.browseBtn} onClick={() => singleFileRef.current?.click()}>Browse Files</button>
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
                                <button type="submit" className={styles.actionBtnPrimary} style={{ width: '100%', marginTop: '2rem' }} disabled={isSealing}>
                                    {isSealing ? <><Loader2 className="animate-spin" size={18} /> Sealing Ledger...</> : <>Generate Cryptographic Proof <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && (
                        <div className={styles.issuanceContent} style={{ textAlign: 'center' }}>
                            <div className={styles.successCircle}><CheckCircle size={64} color="#10b981" /></div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Registry Entry Confirmed</h3>
                            <p className={styles.dashboardSubtitle} style={{ marginBottom: '2rem' }}>
                                Sealed with ID: <strong style={{ color: 'var(--foreground)' }}>{generatedId}</strong>.
                            </p>
                            <div className={styles.actionGrid}>
                                <button className={styles.browseBtn} onClick={() => setStep(1)}>Issue Another</button>
                                <button className={styles.actionBtnPrimary}>View Certificate</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ===== BULK MODE ===== */}
            {mode === 'bulk' && (
                <div className={styles.issuanceContent}>

                    {bulkStep === 'upload' && (
                        <>
                            <input
                                type="file"
                                ref={bulkFileRef}
                                style={{ display: 'none' }}
                                accept=".dzi,.jpg,.jpeg,.png,.xml"
                                multiple
                                onChange={handleBulkInputChange}
                            />
                            <div
                                className={styles.uploadArea}
                                style={{ borderColor: isDragging ? 'var(--accent-color)' : undefined, background: isDragging ? 'var(--accent-light)' : undefined }}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <Layers size={48} opacity={0.2} />
                                <p>Drag and drop multiple product images</p>
                                <span>Supports .JPG, .PNG, .DZI — no limit on quantity</span>
                                <button className={styles.browseBtn} onClick={() => bulkFileRef.current?.click()}>Browse Files</button>
                            </div>

                            {bulkFiles.length > 0 && (
                                <>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {bulkFiles.map((f) => (
                                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                                <FileImage size={16} style={{ flexShrink: 0, color: 'var(--accent-color)' }} />
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.file.name}</span>
                                                <span style={{ color: 'color-mix(in srgb, var(--foreground) 40%, transparent)', flexShrink: 0 }}>
                                                    {(f.file.size / 1024 / 1024).toFixed(1)} MB
                                                </span>
                                                <button onClick={() => removeBulkFile(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'color-mix(in srgb, var(--foreground) 40%, transparent)', padding: 0, lineHeight: 0 }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        id="seal-all-btn"
                                        className={styles.actionBtnPrimary}
                                        style={{ width: '100%', marginTop: '1.5rem' }}
                                        onClick={sealAll}
                                    >
                                        Seal All {bulkFiles.length} {bulkFiles.length === 1 ? 'Image' : 'Images'} <ShieldCheck size={18} />
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {bulkStep === 'processing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p className={styles.dashboardSubtitle} style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                Sealing ledger entries... {doneCount} / {bulkFiles.length} complete
                            </p>
                            {bulkFiles.map((f) => (
                                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                    <FileImage size={16} style={{ flexShrink: 0, color: 'var(--accent-color)' }} />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.file.name}</span>
                                    {f.status === 'pending' && <span style={{ color: 'color-mix(in srgb, var(--foreground) 40%, transparent)', flexShrink: 0 }}>Queued</span>}
                                    {f.status === 'sealing' && <Loader2 size={16} className="animate-spin" style={{ flexShrink: 0, color: 'var(--accent-color)' }} />}
                                    {f.status === 'done' && <CheckCircle size={16} style={{ flexShrink: 0, color: '#10b981' }} />}
                                </div>
                            ))}
                        </div>
                    )}

                    {bulkStep === 'done' && (
                        <div style={{ textAlign: 'center' }}>
                            <div className={styles.successCircle}><CheckCircle size={64} color="#10b981" /></div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{doneCount} Certificates Issued</h3>
                            <p className={styles.dashboardSubtitle} style={{ marginBottom: '1.5rem' }}>
                                All images have been cryptographically sealed and added to the global ledger.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                                {bulkFiles.map((f) => (
                                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', textAlign: 'left' }}>
                                        <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.7 }}>{f.file.name}</span>
                                        <code style={{ flexShrink: 0, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{f.certId}</code>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.actionGrid}>
                                <button className={styles.browseBtn} onClick={resetBulk}>Issue Another Batch</button>
                                <button className={styles.actionBtnPrimary}>Export Report</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
