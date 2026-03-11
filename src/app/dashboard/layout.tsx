"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Database, Activity, Key, Settings, LogOut, ShieldCheck } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const userName = session?.user?.name ?? 'Partner';
    const userEmail = session?.user?.email ?? '';
    const initials = userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className={styles.dashboardShell}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <ShieldCheck color="var(--accent-color)" size={32} />
                    <span className={styles.sidebarBrand}>Partner Portal</span>
                </div>

                <nav className={styles.sidebarNav}>
                    <Link href="/dashboard" className={pathname === '/dashboard' ? styles.navItemActive : styles.navItem}>
                        <LayoutDashboard size={20} /> Overview
                    </Link>
                    <Link href="/dashboard/registry" className={pathname === '/dashboard/registry' ? styles.navItemActive : styles.navItem}>
                        <Database size={20} /> Registry
                    </Link>
                    <Link href="/dashboard/issuance" className={pathname === '/dashboard/issuance' ? styles.navItemActive : styles.navItem}>
                        <Activity size={20} /> Issuance
                    </Link>
                    <Link href="/dashboard/api" className={pathname === '/dashboard/api' ? styles.navItemActive : styles.navItem}>
                        <Key size={20} /> API Access
                    </Link>
                    <div className={styles.navDivider}></div>
                    <Link href="/dashboard/settings" className={pathname === '/dashboard/settings' ? styles.navItemActive : styles.navItem}>
                        <Settings size={20} /> Settings
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>{initials || '?'}</div>
                        <div className={styles.userInfo}>
                            <strong>{userName}</strong>
                            <span>{userEmail}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={styles.logoutBtn}
                        style={{ background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
