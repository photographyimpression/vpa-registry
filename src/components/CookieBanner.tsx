"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('vpa_cookie_consent');
        if (!consent) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem('vpa_cookie_consent', 'accepted');
        document.cookie = 'vpa_cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax';
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('vpa_cookie_consent', 'declined');
        document.cookie = 'vpa_cookie_consent=declined; max-age=31536000; path=/; SameSite=Lax';
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                background: '#111',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                maxWidth: '560px',
                width: 'calc(100vw - 3rem)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
        >
            <Cookie size={22} style={{ color: 'var(--accent-color, #c9a84c)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                    We use essential cookies to keep you signed in. We don&apos;t use tracking or advertising cookies.{' '}
                    <Link href="/cookies" style={{ color: 'var(--accent-color, #c9a84c)', textDecoration: 'none' }}>
                        Cookie Policy
                    </Link>
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={accept}
                        style={{
                            padding: '0.45rem 1.1rem',
                            background: 'var(--accent-color, #c9a84c)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Accept
                    </button>
                    <button
                        onClick={decline}
                        style={{
                            padding: '0.45rem 1.1rem',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                        }}
                    >
                        Decline
                    </button>
                </div>
            </div>
            <button
                onClick={decline}
                aria-label="Dismiss"
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
            >
                <X size={18} />
            </button>
        </div>
    );
}
