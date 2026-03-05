import { getCertificateData } from '@/lib/data';
import { notFound } from 'next/navigation';
import CertificateHeader from '@/components/CertificateHeader';
import CertificateDataGrid from '@/components/CertificateDataGrid';
import DeepZoomViewer from '@/components/DeepZoomViewer';
import DigitalSeal from '@/components/DigitalSeal';
import styles from './Certificate.module.css';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    return {
        title: `VPA Certificate - ${params.id}`,
    };
}

export default async function CertificatePage(props: Props) {
    const params = await props.params;
    const data = await getCertificateData(params.id);

    if (!data) {
        notFound();
    }

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.certificateCard}>
                <DigitalSeal />
                <CertificateHeader manufacturer={data.Manufacturer_Name} />
                <div className={styles.content}>
                    <div className={styles.viewerSection}>
                        <div className={styles.viewerContainer}>
                            <DeepZoomViewer imageUrl={data.Master_Image_URL} />
                            <div className={styles.viewerOverlay}>
                                <div className={styles.scanningLine}></div>
                            </div>
                        </div>
                        <p className={styles.viewerCaption}>
                            INTERACTIVE MASTER IMAGE: Use controls or scroll to inspect physical authenticity at high resolution.
                        </p>
                    </div>
                    <div className={styles.dataSection}>
                        <CertificateDataGrid data={data} />
                    </div>
                </div>
            </main>
        </div>
    );
}
