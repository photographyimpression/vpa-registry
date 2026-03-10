"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, Edit3, ShieldCheck, CheckCircle, ArrowRight, Loader2, Layers, X, FileImage, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import styles from '../Dashboard.module.css';

type UploadedFile = {
    file: File;
    id: string;
    status: 'pending' | 'sealing' | 'done' | 'error';
    certId?: string;
    certifiedImageBase64?: string;
    registryUrl?: string;
    errorMsg?: string;
};

type Mode = 'single' | 'bulk';

export default function IssuancePage() {
    const [mode, setMode] = useState<Mode>('single');
    const [step, setStep] = useState(1);
    const [isSealing, setIsSealing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [singleFile, setSingleFile] = useState<File | null>(null);
    const [result, setResult] = useState<{
        vpaId: string;
        certifiedImageBase64: string;
        registryUrl: string;
        productName: string;
    } | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Bulk state
    const [bulkFiles, setBulkFiles] = useState<UploadedFile[]>([]);
    const [bulkStep, setBulkStep] = useState<'upload' | 'processing' | 'done'>('upload');

    const singleFileRef = useRef<HTMLInputElement>(null);
    const bulkFileRef = useRef<HTMLInputElement>(null);

    // ── SINGLE UPLOAD ────────────────────────────────────────────────────────
    const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSingleFile(e.target.files[0]);
            setStep(2);
        }
    };

    const handleIssue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!singleFile) return;

        setIsSealing(true);
        setErrorMsg('');

        const formEl = e.currentTarget;
        const productName = (formEl.elements.namedItem('productName') as HTMLInputElement)?.value || '';
        const batchId = (formEl.elements.namedItem('batchId') as HTMLInputElement)?.value || '';

        try {
            const formData = new FormData();
            formData.append('image', singleFile);
            formData.append('productName', productName);
            formData.append('batchId', batchId);

            const res = await fetch('/api/certify', { method: 'POST', body: formData });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Certification failed');

            setResult({
                vpaId: data.vpaId,
                certifiedImageBase64: data.certifiedImageBase64,
                registryUrl: data.registryUrl,
                productName,
            });
            setStep(3);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSealing(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${result.certifiedImageBase64}`;
        link.download = `${result.vpaId}-certified.png`;
        link.click();
    };

    const resetSingle = () => {
        setStep(1);
        setSingleFile(null);
        setResult(null);
        setErrorMsg('');
        if (singleFileRef.current) singleFileRef.current.value = '';
    };

    // ── BULK UPLOAD ──────────────────────────────────────────────────────────
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

        for (let i = 0; i < bulkFiles.length; i++) {
            const f = bulkFiles[i];
            setBulkFiles((prev) =>
                prev.map((item, idx) => (idx === i ? { ...item, status: 'sealing' } : item))
            );

            try {
                const formData = new FormData();
                formData.append('image', f.file);
                formData.append('productName', f.file.name.replace(/\.[^.]+$/, ''));
                formData.append('batchId', 'BULK');

                const res = await fetch('/api/certify', { method: 'POST', body: formData });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Failed');

                setBulkFiles((prev) =>
                    prev.map((item, idx) =>
                        idx === i
                            ? {
                                ...item,
                                status: 'done',
                                certId: data.vpaId,
                                certifiedImageBase64: data.certifiedImageBase64,
                                registryUrl: data.registryUrl,
                            }
                            : item
                    )
                );
            } catch (err: unknown) {
                setBulkFiles((prev) =>
                    prev.map((item, idx) =>
                        idx === i
                            ? { ...item, status: 'error', errorMsg: err instanceof Error ? err.message : 'Error' }
                            : item
                    )
                );
            }
        }
        setBulkStep('done');
    };

    const resetBulk = () => {
        setBulkFiles([]);
        setBulkStep('upload');
    };

    const downloadBulkFile = (f: UploadedFile) => {
        if (!f.certifiedImageBase64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${f.certifiedImageBase64}`;
        link.download = `${f.certId}-certified.png`;
        link.click();
    };

    const doneCount = bulkFiles.filter((f) => f.status === 'done').length;

    return (
        <div className={styles.panel} style={{ maxWidth: '860px', margin: '0 auto' }}>
            <header className={styles.panelHeader} style={{ textAlign: 'center', flexDirection: 'column', gap: '1rem' }}>
                <h2 className={styles.panelTitle}>Certificate Issuance Protocol</h2>
                <p className={styles.dashboardSubtitle}>Upload a product photo — we&apos;ll stamp it with a QR code and certification badge.</p>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                        id="single-mode-btn"
                        onClick={() => { setMode('single'); resetSingle(); }}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '100px', border: '1.5px solid', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 600,
                            borderColor: mode === 'single' ? 'var(--accent-color)' : 'var(--border-color)',
                            background: mode === 'single' ? 'var(--accent-light)' : 'transparent',
                            color: mode === 'single' ? 'var(--accent-color)' : 'var(--foreground)',
                            transition: 'all 0.2s ease',
                        }}
                    >Single Protocol</button>
                    <button
                        id="bulk-mode-btn"
                        onClick={() => { setMode('bulk'); resetBulk(); }}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '100px', border: '1.5px solid', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                            borderColor: mode === 'bulk' ? 'var(--accent-color)' : 'var(--border-color)',
                            background: mode === 'bulk' ? 'var(--accent-light)' : 'transparent',
                            color: mode === 'bulk' ? 'var(--accent-color)' : 'var(--foreground)',
                            transition: 'all 0.2s ease',
                        }}
                    ><Layers size={15} /> Bulk Protocol</button>
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
                            <input type="file" ref={singleFileRef} style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.webp" onChange={handleSingleFileSelect} />
                            <div className={styles.uploadArea}>
                                <Upload size={48} opacity={0.2} />
                                <p>Drag and drop your product photo</p>
                                <span>Supports .JPG, .PNG, .WEBP (Max 50MB)</span>
                                <button className={styles.browseBtn} onClick={() => singleFileRef.current?.click()}>Browse Files</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.issuanceContent}>
                            {singleFile && (
                                <p style={{ marginBottom: '1.5rem', opacity: 0.6, fontSize: '0.85rem', textAlign: 'center' }}>
                                    📎 {singleFile.name} ({(singleFile.size / 1024 / 1024).toFixed(1)} MB)
                                </p>
                            )}
                            <form className={styles.issuanceForm} onSubmit={handleIssue}>
                                <div className={styles.formGroup}>
                                    <label>Product Name</label>
                                    <input name="productName" type="text" placeholder="e.g. Luxora Limited Edition A1" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Batch / SKU ID</label>
                                    <input name="batchId" type="text" placeholder="BATCH-2024-X1" required />
                                </div>
                                {errorMsg && (
                                    <p style={{ color: '#ef4444', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        ⚠ {errorMsg}
                                    </p>
                                )}
                                <button type="submit" className={styles.actionBtnPrimary} style={{ width: '100%', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={isSealing}>
                                    {isSealing ? <><Loader2 size={18} className="animate-spin" /> Generating Certificate...</> : <>Generate Cryptographic Proof <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 3 && result && (
                        <div className={styles.issuanceContent} style={{ textAlign: 'center' }}>
                            <div className={styles.successCircle}><CheckCircle size={64} color="#10b981" /></div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Certificate Issued</h3>
                            <p className={styles.dashboardSubtitle} style={{ marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'var(--foreground)' }}>{result.productName}</strong>
                            </p>
                            <code style={{ display: 'block', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', marginBottom: '2rem', padding: '0.5rem', background: 'var(--accent-light)', borderRadius: '6px' }}>
                                {result.vpaId}
                            </code>
                            <p style={{ opacity: 0.55, fontSize: '0.82rem', marginBottom: '2rem' }}>
                                The certified image below has a QR code and VPA badge stamped in the corners. Download it and use it on your product listings.
                            </p>
                            <div className={styles.actionGrid}>
                                <button className={styles.actionBtnPrimary} onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    <Download size={16} /> Download Certified Photo
                                </button>
                                <Link href={result.registryUrl} target="_blank" className={styles.browseBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    <ExternalLink size={16} /> View Registry Entry
                                </Link>
                            </div>
                            <button onClick={resetSingle} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--foreground)', opacity: 0.4, cursor: 'pointer', fontSize: '0.85rem' }}>
                                + Issue Another Certificate
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ===== BULK MODE ===== */}
            {mode === 'bulk' && (
                <div className={styles.issuanceContent}>
                    {bulkStep === 'upload' && (
                        <>
                            <input type="file" ref={bulkFileRef} style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleBulkInputChange} />
                            <div
                                className={styles.uploadArea}
                                style={{ borderColor: isDragging ? 'var(--accent-color)' : undefined, background: isDragging ? 'var(--accent-light)' : undefined }}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <Layers size={48} opacity={0.2} />
                                <p>Drag &amp; drop multiple product images</p>
                                <span>Supports .JPG, .PNG, .WEBP — no limit on quantity</span>
                                <button className={styles.browseBtn} onClick={() => bulkFileRef.current?.click()}>Browse Files</button>
                            </div>

                            {bulkFiles.length > 0 && (
                                <>
                                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {bulkFiles.map((f) => (
                                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                                <FileImage size={16} style={{ flexShrink: 0, color: 'var(--accent-color)' }} />
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.file.name}</span>
                                                <span style={{ color: 'color-mix(in srgb, var(--foreground) 40%, transparent)', flexShrink: 0 }}>{(f.file.size / 1024 / 1024).toFixed(1)} MB</span>
                                                <button onClick={() => removeBulkFile(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'color-mix(in srgb, var(--foreground) 40%, transparent)', padding: 0, lineHeight: 0 }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button id="seal-all-btn" className={styles.actionBtnPrimary} style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={sealAll}>
                                        Seal All {bulkFiles.length} {bulkFiles.length === 1 ? 'Image' : 'Images'} <ShieldCheck size={18} />
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {bulkStep === 'processing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p className={styles.dashboardSubtitle} style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                Certifying images... {doneCount} / {bulkFiles.length} complete
                            </p>
                            {bulkFiles.map((f) => (
                                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                    <FileImage size={16} style={{ flexShrink: 0, color: 'var(--accent-color)' }} />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.file.name}</span>
                                    {f.status === 'pending' && <span style={{ color: 'color-mix(in srgb, var(--foreground) 40%, transparent)', flexShrink: 0 }}>Queued</span>}
                                    {f.status === 'sealing' && <Loader2 size={16} className="animate-spin" style={{ flexShrink: 0, color: 'var(--accent-color)' }} />}
                                    {f.status === 'done' && <CheckCircle size={16} style={{ flexShrink: 0, color: '#10b981' }} />}
                                    {f.status === 'error' && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>Error</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {bulkStep === 'done' && (
                        <div style={{ textAlign: 'center' }}>
                            <div className={styles.successCircle}><CheckCircle size={64} color="#10b981" /></div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{doneCount} of {bulkFiles.length} Certificates Issued</h3>
                            <p className={styles.dashboardSubtitle} style={{ marginBottom: '1.5rem' }}>
                                Download each certified image below — each has a QR code and badge stamped in the corners.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem', maxHeight: '260px', overflowY: 'auto' }}>
                                {bulkFiles.map((f) => (
                                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', textAlign: 'left' }}>
                                        {f.status === 'done' ? <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} /> : <X size={14} color="#ef4444" style={{ flexShrink: 0 }} />}
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.7 }}>{f.file.name}</span>
                                        {f.status === 'done' && f.certId && (
                                            <code style={{ flexShrink: 0, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{f.certId}</code>
                                        )}
                                        {f.status === 'done' && (
                                            <button onClick={() => downloadBulkFile(f)} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', padding: 0 }}>
                                                <Download size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.actionGrid}>
                                <button className={styles.browseBtn} onClick={resetBulk}>Issue Another Batch</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
