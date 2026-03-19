"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Pause, Play, ChevronRight, Loader2, Save,
} from 'lucide-react';
import styles from '../Campaigns.module.css';

type CampaignDetail = {
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

type Prospect = {
    id: string;
    businessName: string;
    website: string;
    email: string;
    status: string;
    tier: string;
    emailedAt: string;
    lastActivity: string;
};

type ProspectsResponse = {
    prospects: Prospect[];
    total: number;
    page: number;
    limit: number;
};

const STATUS_CLASS: Record<string, string> = {
    draft: styles.statusDraft,
    active: styles.statusActive,
    paused: styles.statusPaused,
    completed: styles.statusCompleted,
};

const FUNNEL_COLORS: Record<string, string> = {
    scraped: '#6b7280',
    emailed: '#3b82f6',
    opened: '#8b5cf6',
    clicked: '#f59e0b',
    signed_up: '#10b981',
    integrated: '#c5a034',
};

const FUNNEL_LABELS: Record<string, string> = {
    scraped: 'Scraped',
    emailed: 'Emailed',
    opened: 'Opened',
    clicked: 'Clicked',
    signed_up: 'Signed Up',
    integrated: 'Integrated',
};

const PROSPECT_STATUSES = [
    '',
    'scraped',
    'emailed',
    'opened',
    'clicked',
    'signed_up',
    'integrated',
];

export default function CampaignDetailPage() {
    const { status: authStatus } = useSession();
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [dailyLimit, setDailyLimit] = useState<number>(1);
    const [dailyLimitDirty, setDailyLimitDirty] = useState(false);
    const [savingLimit, setSavingLimit] = useState(false);

    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [prospectsTotal, setProspectsTotal] = useState(0);
    const [prospectsPage, setProspectsPage] = useState(1);
    const [prospectsLimit] = useState(25);
    const [statusFilter, setStatusFilter] = useState('');
    const [prospectsLoading, setProspectsLoading] = useState(false);

    // Fetch campaign detail
    useEffect(() => {
        if (authStatus !== 'authenticated' || !campaignId) return;

        fetch(`/api/campaigns/${campaignId}`)
            .then((r) => {
                if (!r.ok) throw new Error('Not found');
                return r.json();
            })
            .then((data) => {
                setCampaign(data);
                setDailyLimit(data.dailyLimit || 1);
            })
            .catch(() => setCampaign(null))
            .finally(() => setLoading(false));
    }, [authStatus, campaignId]);

    // Fetch prospects
    const fetchProspects = useCallback(() => {
        if (authStatus !== 'authenticated' || !campaignId) return;
        setProspectsLoading(true);

        const params = new URLSearchParams({
            page: String(prospectsPage),
            limit: String(prospectsLimit),
        });
        if (statusFilter) params.set('status', statusFilter);

        fetch(`/api/campaigns/${campaignId}/prospects?${params}`)
            .then((r) => r.json())
            .then((data: ProspectsResponse) => {
                setProspects(data.prospects || []);
                setProspectsTotal(data.total || 0);
            })
            .catch(() => {
                setProspects([]);
                setProspectsTotal(0);
            })
            .finally(() => setProspectsLoading(false));
    }, [authStatus, campaignId, prospectsPage, prospectsLimit, statusFilter]);

    useEffect(() => {
        fetchProspects();
    }, [fetchProspects]);

    const handleToggleStatus = async () => {
        if (!campaign) return;
        setUpdating(true);
        const newStatus = campaign.status === 'active' ? 'paused' : 'active';

        try {
            const res = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const updated = await res.json();
                setCampaign(updated);
            }
        } catch {
            // silently fail
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveDailyLimit = async () => {
        if (!campaign) return;
        setSavingLimit(true);

        try {
            const res = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dailyLimit }),
            });
            if (res.ok) {
                const updated = await res.json();
                setCampaign(updated);
                setDailyLimitDirty(false);
            }
        } catch {
            // silently fail
        } finally {
            setSavingLimit(false);
        }
    };

    const totalPages = Math.ceil(prospectsTotal / prospectsLimit);

    if (authStatus === 'loading' || loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Loading campaign...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className={styles.emptyState}>
                <p>Campaign not found</p>
                <Link href="/dashboard/campaigns" className={styles.backLink}>
                    <ArrowLeft size={16} /> Back to Campaigns
                </Link>
            </div>
        );
    }

    const stats = campaign.stats || { scraped: 0, emailed: 0, opened: 0, clicked: 0, signed_up: 0, integrated: 0 };
    const funnelKeys = ['scraped', 'emailed', 'opened', 'clicked', 'signed_up', 'integrated'] as const;

    return (
        <>
            <Link href="/dashboard/campaigns" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Campaigns
            </Link>

            {/* Header */}
            <div className={styles.detailHeader}>
                <div className={styles.detailHeaderLeft}>
                    <h1>{campaign.name}</h1>
                    <span className={`${styles.statusBadge} ${STATUS_CLASS[campaign.status] || styles.statusDraft}`}>
                        {campaign.status}
                    </span>
                </div>
                <div className={styles.detailActions}>
                    <button
                        className={styles.actionBtn}
                        onClick={handleToggleStatus}
                        disabled={updating || campaign.status === 'completed' || campaign.status === 'draft'}
                    >
                        {campaign.status === 'active' ? (
                            <><Pause size={16} /> Pause</>
                        ) : (
                            <><Play size={16} /> Resume</>
                        )}
                    </button>
                    <button
                        className={styles.actionBtnPrimary}
                        onClick={() => router.push(`/dashboard/campaigns/new`)}
                    >
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Funnel Visualization */}
            <div className={styles.funnelSection}>
                <h3 className={styles.funnelTitle}>Conversion Funnel</h3>
                <div className={styles.funnelStages}>
                    {funnelKeys.map((key, i) => {
                        const value = stats[key] || 0;
                        const prevValue = i > 0 ? (stats[funnelKeys[i - 1]] || 1) : value;
                        const pct = i === 0 ? 100 : prevValue > 0 ? Math.round((value / prevValue) * 100) : 0;

                        return (
                            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                                {i > 0 && (
                                    <ChevronRight size={20} className={styles.funnelArrow} />
                                )}
                                <div className={styles.funnelStage}>
                                    <div
                                        className={styles.funnelStageBar}
                                        style={{
                                            backgroundColor: FUNNEL_COLORS[key],
                                            opacity: 0.15 + (0.85 * (1 - i / funnelKeys.length)),
                                        }}
                                    >
                                        <span style={{ color: FUNNEL_COLORS[key], fontFamily: 'var(--font-mono)' }}>
                                            {value.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className={styles.funnelStageLabel}>{FUNNEL_LABELS[key]}</div>
                                    <div className={styles.funnelStagePercent}>
                                        {i === 0 ? '' : `${pct}%`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Daily Limit Control */}
            <div className={styles.controlSection}>
                <div className={styles.controlLabel}>
                    Daily Send Limit
                    <span>Maximum number of emails to send per day for this campaign</span>
                </div>
                <div className={styles.dailyLimitControl}>
                    <input
                        type="number"
                        className={styles.dailyLimitInput}
                        value={dailyLimit}
                        min={1}
                        max={100}
                        onChange={(e) => {
                            const val = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                            setDailyLimit(val);
                            setDailyLimitDirty(val !== campaign.dailyLimit);
                        }}
                    />
                    <button
                        className={styles.saveBtn}
                        onClick={handleSaveDailyLimit}
                        disabled={!dailyLimitDirty || savingLimit}
                    >
                        {savingLimit ? <Loader2 size={14} className={styles.spinner} /> : <Save size={14} />}
                        {' '}Save
                    </button>
                </div>
            </div>

            {/* Prospects Table */}
            <div className={styles.prospectsSection}>
                <div className={styles.prospectsHeader}>
                    <h3 className={styles.prospectsTitle}>
                        Prospects {prospectsTotal > 0 && <span style={{ opacity: 0.4, fontWeight: 400 }}>({prospectsTotal})</span>}
                    </h3>
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setProspectsPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        {PROSPECT_STATUSES.filter(Boolean).map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                        ))}
                    </select>
                </div>

                {prospectsLoading ? (
                    <div className={styles.loadingState} style={{ padding: '3rem' }}>
                        <Loader2 size={24} className={styles.spinner} />
                    </div>
                ) : prospects.length === 0 ? (
                    <div className={styles.emptyState} style={{ padding: '3rem' }}>
                        <p>No prospects found</p>
                        <span>{statusFilter ? 'Try clearing the status filter.' : 'Prospects will appear once the campaign starts scraping.'}</span>
                    </div>
                ) : (
                    <>
                        <table className={styles.prospectsTable}>
                            <thead>
                                <tr>
                                    <th>Business Name</th>
                                    <th>Website</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Tier</th>
                                    <th>Emailed At</th>
                                    <th>Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prospects.map((prospect) => (
                                    <tr key={prospect.id}>
                                        <td data-label="Business"><strong>{prospect.businessName}</strong></td>
                                        <td data-label="Website">
                                            {prospect.website ? (
                                                <a
                                                    href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--accent-color)', textDecoration: 'none' }}
                                                >
                                                    {prospect.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                </a>
                                            ) : '—'}
                                        </td>
                                        <td data-label="Email" className={styles.prospectEmail}>
                                            {prospect.email || '—'}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`${styles.statusBadge} ${STATUS_CLASS[prospect.status] || styles.statusDraft}`}>
                                                {prospect.status?.replace('_', ' ') || 'unknown'}
                                            </span>
                                        </td>
                                        <td data-label="Tier">
                                            <span className={styles.tierBadge}>{prospect.tier || '—'}</span>
                                        </td>
                                        <td data-label="Emailed At">
                                            {prospect.emailedAt ? new Date(prospect.emailedAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td data-label="Last Activity">
                                            {prospect.lastActivity ? new Date(prospect.lastActivity).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setProspectsPage((p) => Math.max(1, p - 1))}
                                    disabled={prospectsPage <= 1}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {prospectsPage} of {totalPages}
                                </span>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setProspectsPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={prospectsPage >= totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
