"use client";

import { signIn } from 'next-auth/react';
import styles from '@/app/Home.module.css';
import authStyles from './Auth.module.css';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailLoading(true);
        setEmailError('');

        const result = await signIn('credentials', {
            email,
            password,
            callbackUrl: '/dashboard',
            redirect: false,
        });

        if (result?.error) {
            setEmailError('Invalid email or password. Contact your account manager if you need access.');
            setIsEmailLoading(false);
        } else if (result?.url) {
            window.location.href = result.url;
        } else {
            setIsEmailLoading(false);
        }
    };

    return (
        <main className={styles.mainContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className={authStyles.authVault}>
                <div className={authStyles.authHeader}>
                    <ShieldCheck size={48} className={authStyles.authIcon} />
                    <h1 className={authStyles.authTitle}>Partner Sign In</h1>
                    <p className={authStyles.authSubtitle}>Access the VPA Central Registry portal.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                    {/* Google Sign-In */}
                    <button
                        type="button"
                        id="google-signin-btn"
                        className={authStyles.googleBtn}
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isEmailLoading}
                    >
                        {isGoogleLoading ? (
                            <span style={{ opacity: 0.7 }}>Redirecting to Google...</span>
                        ) : (
                            <>
                                <svg className={authStyles.googleIcon} viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className={authStyles.authDivider}>
                        <span>or sign in with email</span>
                    </div>

                    {/* Email / Password Sign-In */}
                    <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className={authStyles.inputGroup}>
                            <label htmlFor="signin-email">Email Address</label>
                            <div className={authStyles.inputWrapper}>
                                <Mail size={18} className={authStyles.inputIcon} />
                                <input
                                    id="signin-email"
                                    type="email"
                                    placeholder="name@organization.com"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isGoogleLoading || isEmailLoading}
                                />
                            </div>
                        </div>

                        <div className={authStyles.inputGroup}>
                            <label htmlFor="signin-password">Password</label>
                            <div className={authStyles.inputWrapper}>
                                <Lock size={18} className={authStyles.inputIcon} />
                                <input
                                    id="signin-password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isGoogleLoading || isEmailLoading}
                                />
                            </div>
                        </div>

                        {emailError && (
                            <p style={{ color: '#ef4444', fontSize: '0.82rem', padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.07)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.18)', margin: 0 }}>
                                {emailError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className={authStyles.authSubmitBtn}
                            disabled={isGoogleLoading || isEmailLoading}
                            style={{ marginTop: '0.25rem' }}
                        >
                            {isEmailLoading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </div>

                <div className={authStyles.authFooter} style={{ marginTop: '3rem' }}>
                    <p>Secured by <strong>VPA AUTHORITY PROTOCOL</strong></p>
                    <p>Don&apos;t have an account? <Link href="/register">Request Access</Link></p>
                    <Link href="/" className={authStyles.backLink}>
                        <ArrowLeft size={16} /> Back to Registry
                    </Link>
                </div>
            </div>
        </main>
    );
}
