"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Target, Plus, Mail, Send, CheckCircle, X, ChevronDown,
    Loader2, Upload, RefreshCw, ExternalLink, Clock, Building2, Store
} from 'lucide-react';
import styles from '@/app/dashboard/Dashboard.module.css';
import type { OutreachContact, ContactStatus, ContactType } from '@/lib/outreach';

const GOAL_BOUTIQUES = 50;
const GOAL_PLATFORMS = 3;

const STATUS_LABELS: Record<ContactStatus, string> = {
    new: 'New',
    emailed: 'Emailed',
    responded: 'Responded',
    demo: 'Demo Scheduled',
    signed: 'Signed',
    rejected: 'Rejected',
};

const STATUS_COLORS: Record<ContactStatus, string> = {
    new: '#6b7280',
    emailed: '#3b82f6',
    responded: '#f59e0b',
    demo: '#8b5cf6',
    signed: '#10b981',
    rejected: '#ef4444',
};

const PIPELINE_COLUMNS: ContactStatus[] = ['new', 'emailed', 'responded', 'demo', 'signed'];

export default function OutreachPage() {
    const [contacts, setContacts] = useState<OutreachContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<OutreachContact | null>(null);
    const [emailDraft, setEmailDraft] = useState<{ subject: string; body: string } | null>(null);
    const [generatingFor, setGeneratingFor] = useState<string | null>(null);
    const [sendingFor, setSendingFor] = useState<string | null>(null);
    const [followupRunning, setFollowupRunning] = useState(false);
    const [followupResult, setFollowupResult] = useState<string | null>(null);
    const [csvImporting, setCsvImporting] = useState(false);
    const csvRef = useRef<HTMLInputElement>(null);

    // Add contact form state
    const [addForm, setAddForm] = useState({ name: '', type: 'boutique' as ContactType, email: '', website: '', notes: '' });
    const [addLoading, setAddLoading] = useState(false);

    async function loadContacts() {
        setLoading(true);
        try {
            const res = await fetch('/api/outreach/contacts');
            const data = await res.json() as { contacts: OutreachContact[] };
            setContacts(data.contacts ?? []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadContacts(); }, []);

    // ── Stats ────────────────────────────────────────────────────────────────
    const signed = contacts.filter(c => c.status === 'signed');
    const signedBoutiques = signed.filter(c => c.type === 'boutique').length;
    const signedPlatforms = signed.filter(c => c.type === 'resale_platform').length;
    const boutiqueProgress = Math.min(100, (signedBoutiques / GOAL_BOUTIQUES) * 100);
    const platformProgress = Math.min(100, (signedPlatforms / GOAL_PLATFORMS) * 100);

    // ── Add Contact ──────────────────────────────────────────────────────────
    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setAddLoading(true);
        try {
            const res = await fetch('/api/outreach/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addForm),
            });
            if (res.ok) {
                setShowAddModal(false);
                setAddForm({ name: '', type: 'boutique', email: '', website: '', notes: '' });
                loadContacts();
            }
        } finally {
            setAddLoading(false);
        }
    }

    // ── CSV Import ───────────────────────────────────────────────────────────
    async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvImporting(true);
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const rows = lines.slice(1).map(line => {
                const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
            });
            const res = await fetch('/api/outreach/contacts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts: rows }),
            });
            const data = await res.json() as { added: number; skipped: number };
            alert(`Imported: ${data.added} added, ${data.skipped} skipped (duplicates or invalid).`);
            loadContacts();
        } finally {
            setCsvImporting(false);
            if (csvRef.current) csvRef.current.value = '';
        }
    }

    // ── Status Update ────────────────────────────────────────────────────────
    async function updateStatus(id: string, status: ContactStatus) {
        await fetch('/api/outreach/contacts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        });
        setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        if (selectedContact?.id === id) setSelectedContact(prev => prev ? { ...prev, status } : prev);
    }

    // ── Delete Contact ───────────────────────────────────────────────────────
    async function deleteContact(id: string) {
        if (!confirm('Remove this contact from your pipeline?')) return;
        await fetch(`/api/outreach/contacts?id=${id}`, { method: 'DELETE' });
        setContacts(prev => prev.filter(c => c.id !== id));
        if (selectedContact?.id === id) setSelectedContact(null);
    }

    // ── Generate Email ───────────────────────────────────────────────────────
    async function generateEmail(contact: OutreachContact) {
        setGeneratingFor(contact.id);
        setSelectedContact(contact);
        setEmailDraft(null);
        try {
            const res = await fetch('/api/outreach/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId: contact.id, tone: 'formal' }),
            });
            const data = await res.json() as { subject?: string; body?: string; error?: string };
            if (data.subject && data.body) {
                setEmailDraft({ subject: data.subject, body: data.body });
            } else {
                alert(data.error ?? 'Failed to generate email. Check ANTHROPIC_API_KEY.');
            }
        } finally {
            setGeneratingFor(null);
        }
    }

    // ── Send Email ───────────────────────────────────────────────────────────
    async function sendEmail() {
        if (!selectedContact || !emailDraft) return;
        setSendingFor(selectedContact.id);
        try {
            const res = await fetch('/api/outreach/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId: selectedContact.id, subject: emailDraft.subject, body: emailDraft.body }),
            });
            const data = await res.json() as { success?: boolean; contact?: OutreachContact; error?: string };
            if (data.success && data.contact) {
                setContacts(prev => prev.map(c => c.id === data.contact!.id ? data.contact! : c));
                setSelectedContact(data.contact);
                setEmailDraft(null);
                alert(`Email sent to ${selectedContact.name}!`);
            } else {
                alert(data.error ?? 'Failed to send. Check RESEND_API_KEY.');
            }
        } finally {
            setSendingFor(null);
        }
    }

    // ── Run Follow-ups ────────────────────────────────────────────────────────
    async function runFollowups() {
        setFollowupRunning(true);
        setFollowupResult(null);
        try {
            const res = await fetch('/api/outreach/followup', { method: 'POST' });
            const data = await res.json() as { message: string; sent: number; errors?: string[] };
            setFollowupResult(`${data.message} — ${data.sent} follow-up${data.sent !== 1 ? 's' : ''} sent.`);
            loadContacts();
        } finally {
            setFollowupRunning(false);
        }
    }

    // ── Column helper ─────────────────────────────────────────────────────────
    const columnContacts = (status: ContactStatus) => contacts.filter(c => c.status === status);

    return (
        <div className={styles.panel} style={{ maxWidth: '100%' }}>
            {/* ── Header ── */}
            <header className={styles.panelHeader} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <Target size={22} color="var(--accent-color)" />
                        <h2 className={styles.panelTitle} style={{ margin: 0 }}>Sales Outreach Pipeline</h2>
                    </div>
                    <p className={styles.dashboardSubtitle} style={{ margin: 0 }}>
                        AI-powered partner acquisition — boutiques &amp; luxury resale platforms
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                        className={styles.browseBtn}
                        onClick={runFollowups}
                        disabled={followupRunning}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                    >
                        {followupRunning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Run Follow-ups
                    </button>
                    <input ref={csvRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
                    <button
                        className={styles.browseBtn}
                        onClick={() => csvRef.current?.click()}
                        disabled={csvImporting}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                    >
                        {csvImporting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        Import CSV
                    </button>
                    <button
                        className={styles.actionBtnPrimary}
                        onClick={() => setShowAddModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                    >
                        <Plus size={14} /> Add Contact
                    </button>
                </div>
            </header>

            {followupResult && (
                <div style={{ margin: '0.75rem 0', padding: '0.65rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✓ {followupResult}</span>
                    <button onClick={() => setFollowupResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={14} /></button>
                </div>
            )}

            {/* ── Progress Bars ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.25rem 0' }}>
                <ProgressCard
                    label="Boutiques Signed"
                    current={signedBoutiques}
                    goal={GOAL_BOUTIQUES}
                    progress={boutiqueProgress}
                    icon={<Store size={16} color="var(--accent-color)" />}
                />
                <ProgressCard
                    label="Resale Platforms Signed"
                    current={signedPlatforms}
                    goal={GOAL_PLATFORMS}
                    progress={platformProgress}
                    icon={<Building2 size={16} color="var(--accent-color)" />}
                />
            </div>

            {/* ── Pipeline Columns ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>
                    <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', overflowX: 'auto' }}>
                    {PIPELINE_COLUMNS.map(status => (
                        <div key={status} style={{ minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.6rem', borderRadius: '8px 8px 0 0', background: 'var(--accent-light)', borderBottom: `2px solid ${STATUS_COLORS[status]}`, marginBottom: '0.5rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status], flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {STATUS_LABELS[status]}
                                </span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5, fontWeight: 600 }}>
                                    {columnContacts(status).length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {columnContacts(status).map(contact => (
                                    <ContactCard
                                        key={contact.id}
                                        contact={contact}
                                        isSelected={selectedContact?.id === contact.id}
                                        isGenerating={generatingFor === contact.id}
                                        isSending={sendingFor === contact.id}
                                        onSelect={() => {
                                            setSelectedContact(contact);
                                            setEmailDraft(null);
                                        }}
                                        onGenerate={() => generateEmail(contact)}
                                        onStatusChange={(s) => updateStatus(contact.id, s)}
                                        onDelete={() => deleteContact(contact.id)}
                                    />
                                ))}
                                {columnContacts(status).length === 0 && (
                                    <div style={{ padding: '1rem 0.75rem', fontSize: '0.75rem', opacity: 0.35, textAlign: 'center', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Email Composer Drawer ── */}
            {selectedContact && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--accent-light)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', margin: 0 }}>{selectedContact.name}</h3>
                            <p style={{ fontSize: '0.82rem', opacity: 0.5, margin: '0.2rem 0 0' }}>{selectedContact.email} · {selectedContact.type === 'resale_platform' ? 'Resale Platform' : 'Boutique'}</p>
                        </div>
                        <button onClick={() => { setSelectedContact(null); setEmailDraft(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                            <X size={18} />
                        </button>
                    </div>

                    {emailDraft ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, display: 'block', marginBottom: '0.35rem' }}>Subject</label>
                                <input
                                    value={emailDraft.subject}
                                    onChange={e => setEmailDraft(d => d ? { ...d, subject: e.target.value } : d)}
                                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5, display: 'block', marginBottom: '0.35rem' }}>Body</label>
                                <textarea
                                    value={emailDraft.body}
                                    onChange={e => setEmailDraft(d => d ? { ...d, body: e.target.value } : d)}
                                    rows={10}
                                    style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background)', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className={styles.actionBtnPrimary}
                                    onClick={sendEmail}
                                    disabled={!!sendingFor}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
                                >
                                    {sendingFor ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    Send Email
                                </button>
                                <button
                                    className={styles.browseBtn}
                                    onClick={() => generateEmail(selectedContact)}
                                    disabled={!!generatingFor}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                                >
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                                <button onClick={() => setEmailDraft(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontSize: '0.85rem' }}>
                                    Discard
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                className={styles.actionBtnPrimary}
                                onClick={() => generateEmail(selectedContact)}
                                disabled={!!generatingFor}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
                            >
                                {generatingFor ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                {generatingFor ? 'Generating…' : 'Generate AI Email'}
                            </button>
                            {selectedContact.website && (
                                <a href={selectedContact.website.startsWith('http') ? selectedContact.website : `https://${selectedContact.website}`} target="_blank" rel="noopener noreferrer" className={styles.browseBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                    <ExternalLink size={14} /> Visit Website
                                </a>
                            )}
                        </div>
                    )}

                    {/* Email history */}
                    {selectedContact.emailHistory.length > 0 && (
                        <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.4, margin: '0 0 0.65rem' }}>Email History</p>
                            {selectedContact.emailHistory.map((entry, i) => (
                                <div key={i} style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '0.4rem', fontSize: '0.82rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <strong>{entry.subject}</strong>
                                        <span style={{ opacity: 0.4, display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                                            <Clock size={11} /> {entry.date}
                                            {entry.type === 'followup' && <span style={{ background: '#f59e0b22', color: '#f59e0b', fontSize: '0.65rem', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: '0.25rem' }}>FOLLOW-UP</span>}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, opacity: 0.5, whiteSpace: 'pre-line', maxHeight: '60px', overflow: 'hidden' }}>{entry.body}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Add Contact Modal ── */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--background)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add Contact</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label>Business Name *</label>
                                <input required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Maison Privé Paris" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Type *</label>
                                <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value as ContactType }))} style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--background)', fontSize: '0.9rem' }}>
                                    <option value="boutique">High-End Boutique</option>
                                    <option value="resale_platform">Luxury Resale Platform</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Contact Email *</label>
                                <input required type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@boutique.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Website</label>
                                <input value={addForm.website} onChange={e => setAddForm(f => ({ ...f, website: e.target.value }))} placeholder="boutique.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Notes</label>
                                <input value={addForm.notes} onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Met at Paris Fashion Week" />
                            </div>
                            <button type="submit" className={styles.actionBtnPrimary} disabled={addLoading} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {addLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Add to Pipeline
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressCard({ label, current, goal, progress, icon }: { label: string; current: number; goal: number; progress: number; icon: React.ReactNode }) {
    return (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--background)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {icon}
                <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5 }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{current}</span>
                <span style={{ opacity: 0.4, fontSize: '0.9rem' }}>/ {goal}</span>
            </div>
            <div style={{ height: '6px', borderRadius: '100px', background: 'var(--accent-light)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: progress >= 100 ? '#10b981' : 'var(--accent-color)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
            </div>
        </div>
    );
}

function ContactCard({ contact, isSelected, isGenerating, isSending, onSelect, onGenerate, onStatusChange, onDelete }: {
    contact: OutreachContact;
    isSelected: boolean;
    isGenerating: boolean;
    isSending: boolean;
    onSelect: () => void;
    onGenerate: () => void;
    onStatusChange: (s: ContactStatus) => void;
    onDelete: () => void;
}) {
    const [showStatus, setShowStatus] = useState(false);

    return (
        <div
            onClick={onSelect}
            style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                background: isSelected ? 'var(--accent-light)' : 'var(--background)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.15s ease',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.3rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={contact.name}>{contact.name}</p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', opacity: 0.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.email}</p>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); onDelete(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, padding: 0, flexShrink: 0 }}
                    title="Remove"
                >
                    <X size={12} />
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'var(--accent-light)', color: 'var(--accent-color)', fontWeight: 600 }}>
                    {contact.type === 'resale_platform' ? 'Platform' : 'Boutique'}
                </span>
                {contact.emailHistory.length > 0 && (
                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>
                        {contact.emailHistory.length} email{contact.emailHistory.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem' }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onGenerate}
                    disabled={isGenerating || isSending}
                    style={{ flex: 1, padding: '0.3rem 0', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', opacity: isGenerating ? 0.5 : 1 }}
                    title="Generate AI email"
                >
                    {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <Mail size={10} />}
                    {isGenerating ? '…' : 'Email'}
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowStatus(s => !s)}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        title="Change status"
                    >
                        <ChevronDown size={10} />
                    </button>
                    {showStatus && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '130px' }}>
                            {(Object.keys(STATUS_LABELS) as ContactStatus[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { onStatusChange(s); setShowStatus(false); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left' }}
                                >
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[s], flexShrink: 0 }} />
                                    {STATUS_LABELS[s]}
                                    {contact.status === s && <CheckCircle size={10} style={{ marginLeft: 'auto', color: '#10b981' }} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
