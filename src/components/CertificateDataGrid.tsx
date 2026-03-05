import { CertificateRecord } from '@/lib/data';
import styles from './CertificateDataGrid.module.css';

export default function CertificateDataGrid({ data }: { data: CertificateRecord }) {
    return (
        <div className={styles.gridContainer}>
            <h3 className={styles.sectionTitle}>REGISTRY DATA</h3>

            <table className={styles.dataTable}>
                <tbody>
                    <tr>
                        <th className={styles.labelCell}>VPA TRACKING ID</th>
                        <td className={styles.valueCellId}>{data.VPA_Tracking_ID}</td>
                    </tr>
                    <tr>
                        <th className={styles.labelCell}>CERT ISSUE DATE</th>
                        <td className={styles.valueCell}>{data.Cert_Issue_Date}</td>
                    </tr>
                    <tr>
                        <th className={styles.labelCell}>MANUFACTURER</th>
                        <td className={styles.valueCell}>{data.Manufacturer_Name.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <th className={styles.labelCell}>DEVICE METADATA</th>
                        <td className={styles.valueCell}>{data.Device_Metadata}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
