import { Settings, User, Bell, Key, Shield } from 'lucide-react';
import styles from '../Dashboard.module.css';

export default function SettingsPage() {
    return (
        <div className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <h2 className={styles.panelTitle}>Settings</h2>
                    <p className={styles.dashboardSubtitle}>Manage your account preferences and configuration.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '640px' }}>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <User size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Account Profile</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Your profile information is managed through your Google account. To update your name or profile picture, visit your Google account settings.
                    </p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Bell size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Notifications</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Email notification preferences coming soon.
                    </p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Key size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>API Access</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Manage your API credentials from the <a href="/dashboard/api" style={{ color: 'var(--accent-color)' }}>API Access</a> page.
                    </p>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Shield size={20} style={{ color: 'var(--accent-color)' }} />
                        <strong>Privacy & Legal</strong>
                    </div>
                    <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                        Review our <a href="/privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</a>, <a href="/terms" style={{ color: 'var(--accent-color)' }}>Terms of Service</a>, and <a href="/cookies" style={{ color: 'var(--accent-color)' }}>Cookie Policy</a>.
                    </p>
                </div>

                <div style={{ border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '1.5rem', background: 'rgba(220,38,38,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Settings size={20} style={{ color: '#ef4444' }} />
                        <strong style={{ color: '#ef4444' }}>Danger Zone</strong>
                    </div>
                    <p style={{ opacity: 0.6, fontSize: '0.875rem', marginBottom: '1rem' }}>
                        To close your account or request data deletion, contact us at <strong>support@vparegistry.com</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}
