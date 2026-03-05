import styles from './CertificateHeader.module.css';
import { ShieldAlert } from 'lucide-react';

export default function CertificateHeader({ manufacturer }: { manufacturer: string }) {
    return (
        <header className={styles.header}>
            <div className={styles.sealContainer}>
                <ShieldAlert size={48} color="var(--seal-color)" strokeWidth={1.5} />
            </div>
            <div className={styles.titles}>
                <h1 className={styles.mainTitle}>OFFICIAL VERIFICATION</h1>
                <h2 className={styles.subTitle}>VPA CENTRAL REGISTRY</h2>
            </div>
            <div className={styles.authority}>
                <p>ISSUED BY THE BUREAU OF STANDARDS</p>
                <p>FOR: {manufacturer.toUpperCase()}</p>
            </div>
        </header>
    );
}
