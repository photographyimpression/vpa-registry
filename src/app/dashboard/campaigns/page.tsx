"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Users, Mail, UserCheck, Plug, Loader2 } from 'lucide-react';
import styles from './Campaigns.module.css';

type Campaign = {
    id: string;
    name: string;
    industry: string;
    city: string;
    country: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    dailyLimit: number;
    createdAt: string;
    stats: {
        scraped: number;
        emailed: number;
        opened: number;
        clicked: number;
        signed_up: number;
        integrated: number;
    };
};

const STATUS_CLASS: Record<string, string> = {
    draft: styles.statusDraft,
    active: styles.statusActive,
    paused: styles.statusPaused,
    completed: styles.statusCompleted,
};

function FunnelMiniBar({ stats }: { stats: Campaign['stats'] }) {
    const total = stats.scraped || 1;
    const segments = [
        { key: 'scraped', value: stats.scraped, cls: styles.funnelScraped },
        { key: 'emailed', value: stats.emailed, cls: styles.funnelEmailed },
        { key: 'opened', value: stats.opened, cls: styles.funnelOpened },
        { key: 'clicked', value: stats.clicked, cls: styles.funnelClicked },
        { key: 'signed_up', value: stats.signed_up, cls: styles.funnelSignedUp },
        { key: 'integrated', value: stats.integrated, cls: styles.funnelIntegrated },
    ];

    return (
        <div>
            <div className={styles.funnelBar}>
                {segments.map((seg) => (
                    <div
                        key={seg.key}
                        className={`${styles.funnelSegment} ${seg.cls}`}
                        style={{ width: `${Math.max((seg.value / total) * 100, seg.value > 0 ? 2 : 0)}%` }}
                        title={`${seg.key}: ${seg.value}`}
                    />
                ))}
            </div>
            <div className={styles.funnelLabels}>
                <span>{stats.scraped} scraped</span>
                <span>{stats.signed_up} signed up</span>
            </div>
        </div>
    );
}

export default function CampaignsPage() {
    const { status: authStatus } = useSession();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authStatus !== 'authenticated') return;

        fetch('/api/campaigns')
            .then((r) => r.json())
            .then((data) => {
                setCampaigns(Array.isArray(data) ? data : []);
            })
            .catch(() => setCampaigns([]))
            .finally(() => setLoading(false));
    }, [authStatus]);

    if (authStatus === 'loading') {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Loading...</p>
            </div>
        );
    }

    const totals = campaigns.reduce(
        (acc, c) => ({
            scraped: acc.scraped + (c.stats?.scraped || 0),
            emailed: acc.emailed + (c.stats?.emailed || 0),
            signedUp: acc.signedUp + (c.stats?.signed_up || 0),
            integrated: acc.integrated + (c.stats?.integrated || 0),
        }),
        { scraped: 0, emailed: 0, signedUp: 0, integrated: 0 }
    );

    return (
        <>
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <h1>Campaigns</h1>
                    <p>Manage your outreach campaigns and track prospect funnels.</p>
                </div>
                <Link href="/dashboard/campaigns/new" className={styles.newCampaignBtn}>
                    <Plus size={18} /> New Campaign
                </Link>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Prospects Scraped</span>
                    <span className={styles.statValue}>
                        {loading ? '...' : totals.scraped.toLocaleString()}
                    </span>
                    <Users size={18} style={{ opacity: 0.3 }} />
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Emails Sent</span>
                    <span className={styles.statValue}>
                        {loading ? '...' : totals.emailed.toLocaleString()}
                    </span>
                    <Mail size={18} style={{ opacity: 0.3 }} />
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Signups</span>
                    <span className={styles.statValue}>
                        {loading ? '...' : totals.signedUp.toLocaleString()}
                    </span>
                    <UserCheck size={18} style={{ opacity: 0.3 }} />
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Integrations</span>
                    <span className={styles.statValue}>
                        {loading ? '...' : totals.integrated.toLocaleString()}
                    </span>
                    <Plug size={18} style={{ opacity: 0.3 }} />
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Fetching campaigns...</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div className={styles.emptyState}>
                    <Users size={48} />
                    <p>No campaigns yet</p>
                    <span>Create your first campaign to start prospecting.</span>
                    <Link href="/dashboard/campaigns/new" className={styles.newCampaignBtn} style={{ marginTop: '1rem' }}>
                        <Plus size={18} /> Create Campaign
                    </Link>
                </div>
            ) : (
                <div className={styles.campaignGrid}>
                    {campaigns.map((campaign) => (
                        <Link
                            key={campaign.id}
                            href={`/dashboard/campaigns/${campaign.id}`}
                            className={styles.campaignCard}
                        >
                            <div className={styles.campaignCardHeader}>
                                <div>
                                    <h3>{campaign.name}</h3>
                                    <span className={styles.campaignMeta}>
                                        {campaign.industry} &middot; {campaign.city}
                                    </span>
                                </div>
                                <span className={`${styles.statusBadge} ${STATUS_CLASS[campaign.status] || styles.statusDraft}`}>
                                    {campaign.status}
                                </span>
                            </div>

                            <FunnelMiniBar stats={campaign.stats || { scraped: 0, emailed: 0, opened: 0, clicked: 0, signed_up: 0, integrated: 0 }} />

                            <div className={styles.campaignCardFooter}>
                                <span>Daily limit: {campaign.dailyLimit}</span>
                                <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
