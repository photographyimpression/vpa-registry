import Papa from 'papaparse';

export interface CertificateRecord {
    VPA_Tracking_ID: string;
    Cert_Issue_Date: string;
    Manufacturer_Name: string;
    Device_Metadata: string;
    Master_Image_URL: string;
    Product_Name?: string;
    Certified_Image_URL?: string;
}

async function fetchAllFromSheets(): Promise<CertificateRecord[]> {
    const url = process.env.GOOGLE_SHEETS_CSV_URL;
    if (!url) return [];

    try {
        const fetchUrl = url.includes('?') ? `${url}&_cb=${Date.now()}` : `${url}?_cb=${Date.now()}`;
        const response = await fetch(fetchUrl, { cache: 'no-store' });

        if (!response.ok) {
            console.error(`[VPA API] Network error: ${response.status} ${response.statusText}`);
            return [];
        }

        const csvText = await response.text();
        const parsed = Papa.parse<CertificateRecord>(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        if (parsed.errors.length > 0) {
            console.error("[VPA API] CSV Parsing errors:", parsed.errors);
        }

        return parsed.data;
    } catch (error) {
        console.error("[VPA API] Critical fetch failure:", error);
        return [];
    }
}

/** Returns ALL certificate records from Google Sheets. */
export async function getAllCertificates(): Promise<CertificateRecord[]> {
    return fetchAllFromSheets();
}

export async function getCertificateData(id: string): Promise<CertificateRecord | null> {
    const url = process.env.GOOGLE_SHEETS_CSV_URL;

    if (!url) {
        console.warn("[VPA API] GOOGLE_SHEETS_CSV_URL missing. Using selective fallback mode.");

        if (id === 'DEMO-123' || id.startsWith('VPA-NEW')) {
            return {
                VPA_Tracking_ID: id,
                Cert_Issue_Date: new Date().toISOString().split('T')[0],
                Manufacturer_Name: 'Secure Capture Systems (Mock)',
                Device_Metadata: 'Lens: 50mm f/1.8, ISO: 100, Sensor: Full Frame CMOS',
                Master_Image_URL: 'https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000001.jp2/info.json',
                Product_Name: 'Demo Product',
            };
        }
        return null;
    }

    const records = await fetchAllFromSheets();
    return records.find(r => r.VPA_Tracking_ID === id) || null;
}
