"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, Database, ShieldCheck, Zap, Globe, Building } from 'lucide-react';
import styles from './CommandPalette.module.css';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);

    const items = [
        { id: 1, name: 'Dashboard Home', icon: LayoutDashboard, url: '/dashboard', category: 'Registry Dashboard' },
        { id: 2, name: 'Blockchain Explorer', icon: Database, url: '/dashboard/registry', category: 'Registry Dashboard' },
        { id: 3, name: 'Issue Certificate', icon: ShieldCheck, url: '/dashboard/issuance', category: 'Registry Dashboard' },
        { id: 4, name: 'Verification Portal', icon: Globe, url: '/verification', category: 'Global Public' },
        { id: 5, name: 'Enterprise Solutions', icon: Building, url: '/enterprise', category: 'Global Public' },
        { id: 6, name: 'System Status', icon: Zap, url: '/platform', category: 'Global Public' },
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.inputWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        autoFocus
                        placeholder="Search for commands or pages..."
                        className={styles.input}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className={styles.shortcut}>ESC</div>
                </div>

                <div className={styles.results}>
                    {items.length > 0 ? (
                        items.map(item => (
                            <div
                                key={item.id}
                                className={styles.item}
                                onClick={() => {
                                    router.push(item.url);
                                    setIsOpen(false);
                                }}
                            >
                                <item.icon size={18} className={styles.itemIcon} />
                                <div className={styles.itemContent}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCategory}>{item.category}</span>
                                </div>
                                <div className={styles.itemAction}>Jump to</div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>No commands found for &quot;{query}&quot;</div>
                    )}
                </div>

                <div className={styles.footer}>
                    <span>Type <kbd>Enter</kbd> to select</span>
                    <span><kbd>↑↓</kbd> to navigate</span>
                </div>
            </div>
        </div>
    );
}
