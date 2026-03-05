import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
    return (
        <>
            <header className={styles.dashboardHeader}>
                <div className={styles.dashboardBadge}>Enterprise Access</div>
                <h1 className={styles.dashboardTitle}>Registry Overview</h1>
                <p className={styles.dashboardSubtitle}>Manage your cryptographic certificates and monitor verification traffic.</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.statLabel}>Total Certificates</span>
                        <svg className={styles.sparkline} viewBox="0 0 60 24">
                            <polyline className={styles.sparklinePoly} points="0,20 10,15 20,18 30,10 40,12 50,5 60,8" />
                        </svg>
                    </div>
                    <span className={styles.statValue}>1,482</span>
                    <div className={`${styles.statTrend} ${styles.trendUp}`}>
                        <ArrowUpRight size={16} /> +12.5%
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.statLabel}>Verification Queries</span>
                        <svg className={styles.sparkline} viewBox="0 0 60 24">
                            <polyline className={styles.sparklinePoly} points="0,5 10,8 20,5 30,12 40,10 50,18 60,15" />
                        </svg>
                    </div>
                    <span className={styles.statValue}>42,801</span>
                    <div className={`${styles.statTrend} ${styles.trendUp}`}>
                        <ArrowUpRight size={16} /> +8.2%
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Security Alerts</span>
                    <span className={styles.statValue}>0</span>
                    <div className={styles.statTrend}>
                        <span className={styles.statusDot}></span> All Systems Nominal
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Global Reach</span>
                    <span className={styles.statValue}>32</span>
                    <span className={styles.statLabel}>Jurisdictions</span>
                </div>
            </div>

            <div className={styles.sectionGrid}>
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Recent Registry Activity</h3>
                        <button className={styles.viewAllBtn}>View All</button>
                    </div>

                    <table className={styles.registryTable}>
                        <thead>
                            <tr>
                                <th>Registry ID</th>
                                <th>Issuance Date</th>
                                <th>Manufacturer</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>DEMO-123</strong></td>
                                <td>2024-03-01</td>
                                <td>Luxora Systems</td>
                                <td><span className={`${styles.statusBadge} ${styles.statusActive}`}>VERIFIED</span></td>
                                <td><MoreHorizontal size={18} opacity={0.4} /></td>
                            </tr>
                            <tr>
                                <td><strong>VPA-LX-992</strong></td>
                                <td>2024-02-28</td>
                                <td>Luxora Systems</td>
                                <td><span className={`${styles.statusBadge} ${styles.statusActive}`}>VERIFIED</span></td>
                                <td><MoreHorizontal size={18} opacity={0.4} /></td>
                            </tr>
                            <tr>
                                <td><strong>VPA-LX-881</strong></td>
                                <td>2024-02-25</td>
                                <td>SecureFab Inc.</td>
                                <td><span className={`${styles.statusBadge} ${styles.statusRevoked}`}>REVOKED</span></td>
                                <td><MoreHorizontal size={18} opacity={0.4} /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Quick Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <button className={`${styles.actionBtnLarge} ${styles.pulseBtn}`} style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
                            Issue New Certificate
                        </button>
                        <button className={styles.actionBtnLarge} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>
                            Bulk Export Registry
                        </button>
                        <button className={styles.actionBtnLarge} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>
                            Audit Report (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
