"use client";

import styles from '@/app/Home.module.css';
import authStyles from '@/app/login/Auth.module.css';
import Link from 'next/link';
import { ArrowLeft, Building2, User, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [company, setCompany] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company, name, email }),
            });
            const data = await res.json() as { success?: boolean; error?: string };
            if (!res.ok || !data.success) {
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }
            setSubmitted(true);
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className={styles.mainContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className={authStyles.authVault} style={{ textAlign: 'center' }}>
                    <CheckCircle2 size={56} style={{ color: 'var(--accent-color)', margin: '0 auto 1.5rem' }} />
                    <h1 className={authStyles.authTitle}>Application Received</h1>
                    <p className={authStyles.authSubtitle} style={{ marginTop: '0.75rem' }}>
                        Thank you, <strong>{name}</strong>. We&apos;ve received your access request for <strong>{company}</strong> and will be in touch at <strong>{email}</strong> within 2 business days.
                    </p>
                    <Link href="/" className={styles.ctaBtn} style={{ display: 'inline-flex', marginTop: '2rem', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border-color)' }}>
                        <ArrowLeft size={16} /> Return to Registry
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.mainContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className={authStyles.authVault}>
                <div className={authStyles.authHeader}>
                    <Building2 size={48} className={authStyles.authIcon} />
                    <h1 className={authStyles.authTitle}>Request Access</h1>
                    <p className={authStyles.authSubtitle}>Apply for a VPA partner account. We&apos;ll review your application and respond within 2 business days.</p>
                </div>

                <form className={authStyles.authForm} onSubmit={handleSubmit}>
                    <div className={authStyles.inputGroup}>
                        <label htmlFor="company">Organization Name</label>
                        <div className={authStyles.inputWrapper}>
                            <Building2 size={18} className={authStyles.inputIcon} />
                            <input
                                type="text"
                                id="company"
                                placeholder="Acme Corp"
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={authStyles.inputGroup}>
                        <label htmlFor="name">Full Name</label>
                        <div className={authStyles.inputWrapper}>
                            <User size={18} className={authStyles.inputIcon} />
                            <input
                                type="text"
                                id="name"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={authStyles.inputGroup}>
                        <label htmlFor="email">Work Email</label>
                        <div className={authStyles.inputWrapper}>
                            <Mail size={18} className={authStyles.inputIcon} />
                            <input
                                type="email"
                                id="email"
                                placeholder="name@organization.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        className={authStyles.authSubmitBtn}
                        style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        disabled={loading}
                    >
                        {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : 'Submit Application'}
                    </button>
                </form>

                <div className={authStyles.authFooter}>
                    <p>Already have an account? <Link href="/login">Sign In</Link></p>
                    <Link href="/" className={authStyles.backLink}>
                        <ArrowLeft size={14} /> Back to Registry
                    </Link>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    );
}
