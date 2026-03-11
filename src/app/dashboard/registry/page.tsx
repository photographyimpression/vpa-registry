import styles from '../Dashboard.module.css';
import Link from 'next/link';
import { getAllCertificates } from '@/lib/data';
import RegistryTable from './RegistryTable';

export const dynamic = 'force-dynamic';

export default async function RegistryPage() {
    const records = await getAllCertificates();

    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>Master Registry Ledger</h2>
                    <p className={styles.dashboardSubtitle}>Manage and monitor your issued authenticity certificates.</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/dashboard/issuance" className={styles.actionBtnPrimary}>Issue New Certificate</Link>
                </div>
            </header>

            <RegistryTable records={records} />
        </div>
    );
}
