"use client";

import { useState } from 'react';
import { Search, Filter, Download, MoreVertical, ExternalLink, Inbox } from 'lucide-react';
import styles from '../Dashboard.module.css';
import Link from 'next/link';
import type { CertificateRecord } from '@/lib/data';

export default function RegistryTable({ records }: { records: CertificateRecord[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = records.filter(r =>
        (r.VPA_Tracking_ID ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.Product_Name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.Manufacturer_Name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        const header = 'Registry ID,Product Name,Manufacturer,Issuance Date\n';
        const rows = records.map(r =>
            `"${r.VPA_Tracking_ID}","${r.Product_Name ?? ''}","${r.Manufacturer_Name}","${r.Cert_Issue_Date}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vpa-registry-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className={styles.tableControls}>
                <div className={styles.searchBar}>
                    <Search size={18} opacity={0.4} />
                    <input
                        type="text"
                        placeholder="Search by Registry ID, Product, or Manufacturer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className={styles.filterBtn}><Filter size={18} /> Filters</button>
            </div>

            {filtered.length > 0 ? (
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
                        {filtered.map((item) => (
                            <tr key={item.VPA_Tracking_ID}>
                                <td data-label="Registry ID"><code className={styles.idBadge}>{item.VPA_Tracking_ID}</code></td>
                                <td data-label="Product Name"><strong>{item.Product_Name ?? item.Manufacturer_Name}</strong></td>
                                <td data-label="Issuance Date">{item.Cert_Issue_Date}</td>
                                <td data-label="Status">
                                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>ACTIVE</span>
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
                    <p>{records.length === 0 ? 'No certificates issued yet' : 'No matching registry records found'}</p>
                    <span>{records.length === 0 ? 'Issue your first certificate to get started' : 'Try adjusting your search'}</span>
                </div>
            )}

            {records.length > 0 && (
                <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className={styles.actionBtnSecondary} onClick={handleExport}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            )}
        </>
    );
}
