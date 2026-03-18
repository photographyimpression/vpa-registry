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
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsEmailLoading(true);
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        if (result?.error) {
            setError('Invalid email or password');
            setIsEmailLoading(false);
        } else {
            window.location.href = '/dashboard';
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

                <form className={authStyles.authForm} onSubmit={handleEmailSignIn}>
                    <div className={authStyles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <div className={authStyles.inputWrapper}>
                            <Mail size={16} className={authStyles.inputIcon} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="partner@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    <div className={authStyles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={authStyles.inputWrapper}>
                            <Lock size={16} className={authStyles.inputIcon} />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>
                    {error && (
                        <p style={{ color: '#e53e3e', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>
                    )}
                    <button
                        type="submit"
                        className={authStyles.authSubmitBtn}
                        disabled={isEmailLoading}
                    >
                        {isEmailLoading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className={authStyles.authDivider}><span>or</span></div>

                <button
                    type="button"
                    className={authStyles.googleBtn}
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    style={{ width: '100%' }}
                >
                    {isGoogleLoading ? (
                        <span style={{ opacity: 0.7 }}>Redirecting to Google…</span>
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

                <div className={authStyles.authFooter}>
                    <p>Secured by <strong>VPA AUTHORITY PROTOCOL</strong></p>
                    <p>Don&apos;t have an account? <Link href="/register">Inquire for Access</Link></p>
                    <Link href="/" className={authStyles.backLink}>
                        <ArrowLeft size={16} /> Back to Registry
                    </Link>
                </div>
            </div>
        </main>
    );
}
