"use client";

import { useEffect, useState } from 'react';
import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import type { CertificateRecord } from '@/lib/data';

type DashboardData = {
    totalCertificates: number;
    recent: CertificateRecord[];
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then((r) => r.json())
            .then((d) => setData(d))
            .catch(() => setData({ totalCertificates: 0, recent: [] }))
            .finally(() => setLoading(false));
    }, []);

    const totalCertificates = data?.totalCertificates ?? 0;
    const recent = data?.recent ?? [];

    return (
        <>
            <header className={styles.dashboardHeader}>
                <div className={styles.dashboardBadge}>Partner Access</div>
                <h1 className={styles.dashboardTitle}>Registry Overview</h1>
                <p className={styles.dashboardSubtitle}>Manage your certified product photos and monitor registry activity.</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.statLabel}>Total Certificates</span>
                        {!loading && totalCertificates > 0 && (
                            <svg className={styles.sparkline} viewBox="0 0 60 24">
                                <polyline className={styles.sparklinePoly} points="0,20 10,15 20,18 30,10 40,12 50,5 60,8" />
                            </svg>
                        )}
                    </div>
                    <span className={styles.statValue}>
                        {loading ? '…' : totalCertificates.toLocaleString()}
                    </span>
                    {!loading && totalCertificates > 0 && (
                        <div className={`${styles.statTrend} ${styles.trendUp}`}>
                            <ArrowUpRight size={16} /> Live from Google Sheets
                        </div>
                    )}
                    {!loading && totalCertificates === 0 && (
                        <div className={styles.statTrend}>
                            <span className={styles.statusDot}></span> No records yet
                        </div>
                    )}
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Security Alerts</span>
                    <span className={styles.statValue}>0</span>
                    <div className={styles.statTrend}>
                        <span className={styles.statusDot}></span> All Systems Nominal
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Certification Engine</span>
                    <span className={styles.statValue} style={{ fontSize: '1.2rem', paddingTop: '0.5rem' }}>Active</span>
                    <div className={`${styles.statTrend} ${styles.trendUp}`}>
                        <span className={styles.statusDot}></span> n8n Workflow Online
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Registry Status</span>
                    <span className={styles.statValue} style={{ fontSize: '1.2rem', paddingTop: '0.5rem' }}>Global</span>
                    <span className={styles.statLabel}>Publicly Verifiable</span>
                </div>
            </div>

            <div className={styles.sectionGrid}>
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Recent Certificate Activity</h3>
                        <Link href="/dashboard/registry" className={styles.viewAllBtn}>View All</Link>
                    </div>

                    {loading ? (
                        <p style={{ opacity: 0.4, padding: '2rem', textAlign: 'center' }}>Loading registry data…</p>
                    ) : recent.length === 0 ? (
                        <p style={{ opacity: 0.4, padding: '2rem', textAlign: 'center' }}>
                            No certificates yet.{' '}
                            <Link href="/dashboard/issuance" style={{ color: 'var(--accent-color)' }}>Issue your first one →</Link>
                        </p>
                    ) : (
                        <table className={styles.registryTable}>
                            <thead>
                                <tr>
                                    <th>Registry ID</th>
                                    <th>Issue Date</th>
                                    <th>Product / Manufacturer</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((record) => (
                                    <tr key={record.VPA_Tracking_ID}>
                                        <td><strong>{record.VPA_Tracking_ID}</strong></td>
                                        <td>{record.Cert_Issue_Date}</td>
                                        <td>{record.Product_Name || record.Manufacturer_Name || '—'}</td>
                                        <td><span className={`${styles.statusBadge} ${styles.statusActive}`}>VERIFIED</span></td>
                                        <td>
                                            <Link href={`/id/${record.VPA_Tracking_ID}`} target="_blank">
                                                <MoreHorizontal size={18} opacity={0.4} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Quick Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Link href="/dashboard/issuance" className={`${styles.actionBtnLarge} ${styles.pulseBtn}`} style={{ background: 'var(--foreground)', color: 'var(--background)', textDecoration: 'none', textAlign: 'center' }}>
                            Issue New Certificate
                        </Link>
                        <Link href="/dashboard/registry" className={styles.actionBtnLarge} style={{ border: '1px solid var(--border-color)', background: 'transparent', textDecoration: 'none', textAlign: 'center' }}>
                            Browse Registry
                        </Link>
                        <Link href="/verification" target="_blank" className={styles.actionBtnLarge} style={{ border: '1px solid var(--border-color)', background: 'transparent', textDecoration: 'none', textAlign: 'center' }}>
                            Public Verification Portal ↗
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
