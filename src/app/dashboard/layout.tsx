"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Database, Activity, Key, Settings, LogOut, ShieldCheck, User } from 'lucide-react';
import styles from './Dashboard.module.css';

// Force dynamic rendering — dashboard is always auth-gated, never static
export const dynamic = 'force-dynamic';

// Inner component — must be inside SessionProvider to call useSession()
function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const name = session?.user?.name ?? 'Partner';
    const email = session?.user?.email ?? '';
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase() || 'P';

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
                        {session?.user?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={session.user.image}
                                alt={name}
                                className={styles.avatar}
                                style={{ borderRadius: '50%', objectFit: 'cover', width: '36px', height: '36px' }}
                            />
                        ) : (
                            <div className={styles.avatar}>{initials}</div>
                        )}
                        <div className={styles.userInfo}>
                            <strong title={name}>{name}</strong>
                            <span title={email}>{email || <User size={12} />}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={styles.logoutBtn}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
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

// Outer layout — provides SessionProvider context for all dashboard pages
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <DashboardShell>{children}</DashboardShell>
        </SessionProvider>
    );
}
