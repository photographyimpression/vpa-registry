import { Copy, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import styles from '../Dashboard.module.css';

export default function ApiPage() {
    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>Developer & API Access</h2>
                    <p className={styles.dashboardSubtitle}>Automate your authenticity certification flow via our REST API.</p>
                </div>
                <div className={styles.statusBadge} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    ENTERPRISE TIER
                </div>
            </header>

            <div className={styles.apiGrid}>
                <div className={styles.apiKeySection}>
                    <div className={styles.statLabel}>Production API Key</div>
                    <div className={styles.keyWrapper}>
                        <code className={styles.keyCode}>vpa_live_••••••••••••••••••••••••••••</code>
                        <button className={styles.copyBtn} title="Copy to clipboard"><Copy size={16} /></button>
                    </div>
                    <div className={styles.keyMeta}>
                        <span>Last rotated: Jan 12, 2024</span>
                        <button className={styles.rotateBtn}><RefreshCw size={14} /> Rotate Key</button>
                    </div>
                </div>

                <div className={styles.apiFeatures}>
                    <div className={styles.apiFeatureCard}>
                        <Zap size={24} color="#D4AF37" />
                        <div>
                            <h4>High-Speed Endpoints</h4>
                            <p>Global edge caching ensures 50ms latency for verification lookups.</p>
                        </div>
                    </div>
                    <div className={styles.apiFeatureCard}>
                        <ShieldCheck size={24} color="#10b981" />
                        <div>
                            <h4>Webhooks</h4>
                            <p>Receive real-time notifications on suspicious query patterns.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.docSection}>
                <h4 className={styles.panelTitle} style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Implementation Example</h4>
                <pre className={styles.codeBlock}>
                    {`POST /v4/issue
Authorization: Bearer vpa_live_...
Content-Type: application/json

{
  "image_url": "https://cdn.brand.com/prod_001.jpg",
  "metadata": {
    "product": "Luxora Series X",
    "batch": "LX-2024-01"
  }
}`}
                </pre>
            </div>
        </div>
    );
}
