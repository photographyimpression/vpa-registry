"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import styles from './SearchPortal.module.css';

export default function SearchPortal() {
    const [registryId, setRegistryId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanId = registryId.trim();
        if (!cleanId) return;

        // Basic Registry ID Validation (Example: alphanumeric with hyphens)
        const idPattern = /^[A-Z0-9-]+$/i;
        if (!idPattern.test(cleanId)) {
            alert("Please enter a valid Registry ID (Alphanumeric and hyphens only)");
            return;
        }

        setIsSearching(true);
        setTimeout(() => {
            router.push(`/id/${encodeURIComponent(cleanId)}`);
        }, 1200); // Slightly longer for the animation feel
    };

    return (
        <div className={styles.portalContainer}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="ENTER REGISTRY ID"
                            value={registryId}
                            onChange={(e) => setRegistryId(e.target.value)}
                            disabled={isSearching}
                            aria-label="Registry ID"
                            autoComplete="off"
                            spellCheck="false"
                        />
                        {registryId && !isSearching && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={() => setRegistryId('')}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <button
                    type="submit"
                    className={`${styles.searchButton} ${isSearching ? styles.searching : ''}`}
                    disabled={isSearching || !registryId.trim()}
                >
                    {isSearching ? (
                        <div className={styles.verifyAnimation}>
                            <Loader2 className={styles.spinner} size={18} />
                            <span>VERIFYING</span>
                        </div>
                    ) : (
                        'VERIFY'
                    )}
                </button>
            </form>
            <div className={styles.helpText}>
                <p>Example: DEMO-123</p>
            </div>
            {/* Screen Reader Announcements */}
            <div className="sr-only" role="status" aria-live="polite">
                {isSearching ? `Verifying certificate ${registryId}. Please hold.` : ''}
            </div>
        </div>
    );
}
