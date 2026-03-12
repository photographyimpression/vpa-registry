"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, User, Bell, Key, Shield, CreditCard, Loader2, ExternalLink } from 'lucide-react';
import styles from '../Dashboard.module.css';
import Link from 'next/link';

const PLAN_LABELS: Record<string, string> = {
    free:         'Free',
    starter:      'Starter — $49/mo',
    professional: 'Professional — $149/mo',
    enterprise:   'Enterprise',
};

const PLAN_BADGE_COLORS: Record<string, string> = {
    free:         'rgba(255,255,255,0.1)',
    starter:      'rgba(200,169,110,0.15)',
    professional: 'rgba(200,169,110,0.3)',
    enterprise:   'rgba(200,169,110,0.45)',
};

export default function SettingsPage() {
    const { data: session } = useSession();
    const plan = (session?.user as { plan?: string })?.plan ?? 'free';

    const [portalLoading, setPortalLoading] = useState(false);
    const [portalError, setPortalError] = useState<string | null>(null);

    async function openBillingPortal() {
        setPortalLoading(true);
        setPortalError(null);
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json() as { url?: string; error?: string };
            if (!res.ok || !data.url) {
                setPortalError(data.error ?? 'Could not open billing portal. Please try again.');
                return;
            }
            window.location.href = data.url;
        } catch {
            setPortalError('Network error. Please try again.');
        } finally {
            setPortalLoading(false);
        }
    }

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>Settings</h2>
                    <p className={styles.dashboardSubtitle}>Manage your account preferences and configuration.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '640px' }}>

                {/* Account Profile */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <User size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Account Profile</strong>
                    </div>
                    {session?.user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            {session.user.image && (
                                <img src={session.user.image} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-color)' }} />
                            )}
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{session.user.name}</div>
                                <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>{session.user.email}</div>
                            </div>
                        </div>
                    )}
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Profile information is managed through your Google account.
                    </p>
                </div>

                {/* Billing & Subscription */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <CreditCard size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Billing &amp; Subscription</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '4px' }}>Current plan</div>
                            <span style={{
                                background: PLAN_BADGE_COLORS[plan] ?? PLAN_BADGE_COLORS.free,
                                color: 'var(--accent-color)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: '1px solid var(--accent-color)',
                            }}>
                                {PLAN_LABELS[plan] ?? plan}
                            </span>
                        </div>
                        {plan === 'free' ? (
                            <Link
                                href="/pricing"
                                style={{
                                    padding: '8px 16px',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    borderRadius: '6px',
                                    fontSize: '0.825rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                Upgrade <ExternalLink size={13} />
                            </Link>
                        ) : (
                            <button
                                onClick={openBillingPortal}
                                disabled={portalLoading}
                                style={{
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    color: 'var(--accent-color)',
                                    border: '1px solid var(--accent-color)',
                                    borderRadius: '6px',
                                    fontSize: '0.825rem',
                                    fontWeight: 600,
                                    cursor: portalLoading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                {portalLoading
                                    ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Opening…</>
                                    : <><ExternalLink size={13} /> Manage Billing</>
                                }
                            </button>
                        )}
                    </div>

                    {portalError && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{portalError}</p>
                    )}
                    {plan === 'free' && (
                        <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>
                            You&apos;re on the free plan. Upgrade to start issuing certificates.
                        </p>
                    )}
                    {plan !== 'free' && (
                        <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>
                            Manage your payment method, view invoices, or cancel via the Stripe billing portal.
                        </p>
                    )}
                </div>

                {/* Notifications */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Bell size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Notifications</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Email notification preferences coming soon.
                    </p>
                </div>

                {/* API Access */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Key size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>API Access</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Manage your API credentials from the{' '}
                        <a href="/dashboard/api" style={{ color: 'var(--accent-color)' }}>API Access</a> page.
                        {(plan === 'free' || plan === 'starter') && ' API access requires Professional plan or above.'}
                    </p>
                </div>

                {/* Privacy & Legal */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Shield size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Privacy &amp; Legal</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Review our{' '}
                        <a href="/privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</a>,{' '}
                        <a href="/terms" style={{ color: 'var(--accent-color)' }}>Terms of Service</a>, and{' '}
                        <a href="/cookies" style={{ color: 'var(--accent-color)' }}>Cookie Policy</a>.
                    </p>
                </div>

                {/* Danger Zone */}
                <div style={{ border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '1.5rem', background: 'rgba(220,38,38,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Settings size={20} style={{ color: '#ef4444' }} />
                        <strong style={{ color: '#ef4444' }}>Danger Zone</strong>
                    </div>
                    <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>
                        To close your account or request data deletion, contact us at{' '}
                        <strong>support@vparegistry.com</strong>.
                    </p>
                </div>

            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
