"use client";

import { useState } from 'react';
import { Search, Filter, Download, MoreVertical, ExternalLink, Inbox } from 'lucide-react';
import styles from '../Dashboard.module.css';
import Link from 'next/link';

export default function RegistryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const items = [
        { id: 'DEMO-123', date: '2024-03-01', product: 'Chronos Imperial Watch', status: 'Active', views: 242 },
        { id: 'VPA-LX-992', date: '2024-02-28', product: 'Luxora Onyx Watch', status: 'Active', views: 89 },
        { id: 'VPA-LX-881', date: '2024-02-25', product: 'Titanium Diver X', status: 'Revoked', views: 12 },
        { id: 'VPA-LX-770', date: '2024-02-20', product: 'Classic Leather Strap', status: 'Active', views: 45 },
        { id: 'VPA-LX-665', date: '2024-02-15', product: 'Gold Series Bezel', status: 'Active', views: 132 },
    ];

    const filteredItems = items.filter(item =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
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

            {filteredItems.length > 0 ? (
                <table className={styles.registryTable}>
                    <thead>
                        <tr>
                            <th>Registry ID</th>
                            <th>Product Name</th>
                            <th>Issuance Date</th>
                            <th>Traffic</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id}>
                                <td data-label="Registry ID"><code className={styles.idBadge}>{item.id}</code></td>
                                <td data-label="Product Name"><strong>{item.product}</strong></td>
                                <td data-label="Issuance Date">{item.date}</td>
                                <td data-label="Traffic">{item.views} views</td>
                                <td data-label="Status">
                                    <span className={`${styles.statusBadge} ${item.status === 'Active' ? styles.statusActive : styles.statusRevoked}`}>
                                        {item.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className={styles.tableActions}>
                                    <Link href={`/id/${item.id}`} target="_blank" title="View Public Certificate">
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
