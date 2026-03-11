"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, ExternalLink, Inbox, Loader2 } from 'lucide-react';
import styles from '../Dashboard.module.css';
import Link from 'next/link';
import type { CertificateRecord } from '@/lib/data';

export default function RegistryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<CertificateRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then((r) => r.json())
            .then((d) => {
                // The API returns all recent certificates or everything
                // depending on /api/dashboard configuration. 
                // We'll use d.recent which is an array of records.
                setItems(d.recent || []);
            })
            .catch((err) => console.error('Failed to load registry:', err))
            .finally(() => setLoading(false));
    }, []);

    const filteredItems = items.filter(item =>
        item.VPA_Tracking_ID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Product_Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Manufacturer_Name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>Master Registry Ledger</h2>
                    <p className={styles.dashboardSubtitle}>Manage and monitor your issued authenticity certificates.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtnSecondary}><Download size={16} /> Export CSV</button>
                    <Link href="/dashboard/issuance" className={styles.actionBtnPrimary}>Issue New Certificate</Link>
                </div>
            </header>

            <div className={styles.tableControls}>
                <div className={styles.searchBar}>
                    <Search size={18} opacity={0.4} />
                    <input
                        type="text"
                        placeholder="Search by Registry ID or Product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className={styles.filterBtn}><Filter size={18} /> Filters</button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', opacity: 0.5 }}>
                    <Loader2 size={32} className="animate-spin" />
                </div>
            ) : filteredItems.length > 0 ? (
                <table className={styles.registryTable}>
                    <thead>
                        <tr>
                            <th>Registry ID</th>
                            <th>Product Name</th>
                            <th>Issuance Date</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.VPA_Tracking_ID}>
                                <td data-label="Registry ID"><code className={styles.idBadge}>{item.VPA_Tracking_ID}</code></td>
                                <td data-label="Product Name"><strong>{item.Product_Name || item.Manufacturer_Name || '—'}</strong></td>
                                <td data-label="Issuance Date">{item.Cert_Issue_Date}</td>
                                <td data-label="Status">
                                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                        VERIFIED
                                    </span>
                                </td>
                                <td className={styles.tableActions}>
                                    <Link href={`/id/${item.VPA_Tracking_ID}`} target="_blank" title="View Public Certificate">
                                        <ExternalLink size={18} opacity={0.4} />
                                    </Link>
                                    <MoreVertical size={18} opacity={0.4} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyState}>
                    <Inbox size={48} opacity={0.1} />
                    <p>No matching registry records found</p>
                    <span>Try adjusting your search or filters</span>
                </div>
            )}
        </div>
    );
}
