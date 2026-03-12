'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[VPA] Unhandled error:', error);
    }, [error]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
                <AlertTriangle size={48} style={{ color: '#f59e0b', margin: '0 auto 1.5rem' }} />
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
                <p style={{ opacity: 0.5, marginBottom: '2rem', lineHeight: '1.6' }}>
                    An unexpected error occurred. Please try again, or return to the registry home page.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={reset}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        <RefreshCw size={16} /> Try Again
                    </button>
                    <Link
                        href="/"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'var(--accent-color, #c9a84c)', border: 'none', color: '#000', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem' }}
                    >
                        Return to Registry
                    </Link>
                </div>
            </div>
        </div>
    );
}
