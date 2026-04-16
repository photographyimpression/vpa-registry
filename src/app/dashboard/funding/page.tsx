"use client";

import { useState } from 'react';
import {
    DollarSign, TrendingUp, Clock, CheckCircle, XCircle,
    ChevronRight, FileText, Upload, Phone, HelpCircle,
    PenTool, AlertCircle, ExternalLink, Sparkles, Eye,
    SkipForward, Filter,
} from 'lucide-react';
import styles from '../Dashboard.module.css';
import fundingStyles from './Funding.module.css';
import {
    FUNDING_OPPORTUNITIES,
    HUMAN_TASKS,
    STATUS_LABELS,
    CATEGORY_LABELS,
    TASK_TYPE_LABELS,
    PRIORITY_LABELS,
    getTotalPotentialFunding,
    getHighPriorityTaskCount,
    type FundingOpportunity,
    type HumanTask,
    type FundingStatus,
    type TaskStatus,
} from '@/lib/funding-data';

const TASK_TYPE_ICONS: Record<string, typeof FileText> = {
    'review-draft': FileText,
    'upload-document': Upload,
    'schedule-call': Phone,
    'verify-info': HelpCircle,
    'sign-document': PenTool,
    'answer-question': HelpCircle,
};

const STATUS_COLORS: Record<FundingStatus, string> = {
    discovered: '#6366f1',
    evaluating: '#f59e0b',
    drafting: '#8b5cf6',
    'ready-for-review': '#c5a034',
    submitted: '#3b82f6',
    approved: '#10b981',
    rejected: '#ef4444',
};

export default function FundingPage() {
    const [tasks, setTasks] = useState<HumanTask[]>(HUMAN_TASKS);
    const [opportunities] = useState<FundingOpportunity[]>(FUNDING_OPPORTUNITIES);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [pipelineFilter, setPipelineFilter] = useState<FundingStatus | 'all'>('all');

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status !== 'pending');
    const totalPotential = getTotalPotentialFunding();
    const highPriorityCount = getHighPriorityTaskCount();

    const filteredOpportunities = pipelineFilter === 'all'
        ? opportunities
        : opportunities.filter(o => o.status === pipelineFilter);

    const handleTaskAction = (taskId: string, action: TaskStatus) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: action } : t
        ));
        setExpandedTask(null);
    };

    const pipelineCounts = {
        discovered: opportunities.filter(o => o.status === 'discovered').length,
        evaluating: opportunities.filter(o => o.status === 'evaluating').length,
        drafting: opportunities.filter(o => o.status === 'drafting').length,
        'ready-for-review': opportunities.filter(o => o.status === 'ready-for-review').length,
        submitted: opportunities.filter(o => o.status === 'submitted').length,
        approved: opportunities.filter(o => o.status === 'approved').length,
        rejected: opportunities.filter(o => o.status === 'rejected').length,
    };

    return (
        <>
            <header className={styles.dashboardHeader}>
                <div className={styles.dashboardBadge}>Funding Autopilot</div>
                <h1 className={styles.dashboardTitle}>Funding Dashboard</h1>
                <p className={styles.dashboardSubtitle}>
                    AI discovers and drafts grant applications. You just approve.
                </p>
            </header>

            {/* ── Stats ── */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Potential</span>
                    <span className={styles.statValue} style={{ fontSize: '1.5rem' }}>
                        ${(totalPotential / 1000).toFixed(0)}K
                    </span>
                    <div className={`${styles.statTrend} ${styles.trendUp}`}>
                        <TrendingUp size={16} /> {opportunities.length} opportunities
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Needs Your Input</span>
                    <span className={styles.statValue} style={{ fontSize: '1.5rem' }}>
                        {pendingTasks.length}
                    </span>
                    {highPriorityCount > 0 && (
                        <div className={`${styles.statTrend}`} style={{ color: '#f59e0b' }}>
                            <AlertCircle size={16} /> {highPriorityCount} urgent
                        </div>
                    )}
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>In Progress</span>
                    <span className={styles.statValue} style={{ fontSize: '1.5rem' }}>
                        {opportunities.filter(o => ['evaluating', 'drafting', 'ready-for-review'].includes(o.status)).length}
                    </span>
                    <div className={styles.statTrend}>
                        <Sparkles size={16} /> AI working on it
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Submitted</span>
                    <span className={styles.statValue} style={{ fontSize: '1.5rem' }}>
                        {opportunities.filter(o => o.status === 'submitted').length}
                    </span>
                    <div className={styles.statTrend}>
                        <Clock size={16} /> Awaiting response
                    </div>
                </div>
            </div>

            {/* ── Human Approval Queue ── */}
            <div className={fundingStyles.section}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>
                        <DollarSign size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                        Your Approval Queue
                    </h3>
                    <span className={fundingStyles.queueCount}>
                        {pendingTasks.length} pending
                    </span>
                </div>

                {pendingTasks.length === 0 ? (
                    <div className={fundingStyles.emptyQueue}>
                        <CheckCircle size={48} style={{ opacity: 0.15 }} />
                        <p>All caught up! No tasks need your attention.</p>
                    </div>
                ) : (
                    <div className={fundingStyles.taskList}>
                        {pendingTasks.map(task => {
                            const TaskIcon = TASK_TYPE_ICONS[task.type] || HelpCircle;
                            const isExpanded = expandedTask === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className={`${fundingStyles.taskCard} ${isExpanded ? fundingStyles.taskCardExpanded : ''}`}
                                >
                                    <div
                                        className={fundingStyles.taskHeader}
                                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                                    >
                                        <div className={fundingStyles.taskLeft}>
                                            <div className={`${fundingStyles.taskIcon} ${fundingStyles[`priority${task.priority}`]}`}>
                                                <TaskIcon size={18} />
                                            </div>
                                            <div className={fundingStyles.taskInfo}>
                                                <span className={fundingStyles.taskTitle}>{task.title}</span>
                                                <span className={fundingStyles.taskMeta}>
                                                    {task.fundingName} &middot; {TASK_TYPE_LABELS[task.type]}
                                                    {task.deadline && (
                                                        <> &middot; Due {task.deadline}</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={fundingStyles.taskRight}>
                                            <span className={`${fundingStyles.priorityBadge} ${fundingStyles[`priority${task.priority}Badge`]}`}>
                                                {PRIORITY_LABELS[task.priority]}
                                            </span>
                                            <ChevronRight
                                                size={18}
                                                style={{
                                                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                                                    transition: 'transform 0.2s',
                                                    opacity: 0.4,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className={fundingStyles.taskBody}>
                                            <p className={fundingStyles.taskDescription}>{task.description}</p>

                                            <div className={fundingStyles.aiSuggestionBox}>
                                                <div className={fundingStyles.aiSuggestionHeader}>
                                                    <Sparkles size={16} />
                                                    <span>AI Suggestion</span>
                                                </div>
                                                <p className={fundingStyles.aiSuggestionText}>{task.aiSuggestion}</p>
                                            </div>

                                            <div className={fundingStyles.taskActions}>
                                                <button
                                                    className={fundingStyles.approveBtn}
                                                    onClick={() => handleTaskAction(task.id, 'approved')}
                                                >
                                                    <CheckCircle size={16} />
                                                    {task.type === 'review-draft' ? 'Approve & Submit' :
                                                     task.type === 'verify-info' ? 'Confirm' :
                                                     task.type === 'schedule-call' ? 'Prepare Cheat Sheet' :
                                                     'Approve'}
                                                </button>
                                                <button
                                                    className={fundingStyles.rejectBtn}
                                                    onClick={() => handleTaskAction(task.id, 'rejected')}
                                                >
                                                    <XCircle size={16} /> Not Now
                                                </button>
                                                <button
                                                    className={fundingStyles.skipBtn}
                                                    onClick={() => handleTaskAction(task.id, 'skipped')}
                                                >
                                                    <SkipForward size={16} /> Skip
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {completedTasks.length > 0 && (
                    <div className={fundingStyles.completedSection}>
                        <span className={fundingStyles.completedLabel}>
                            {completedTasks.length} completed
                        </span>
                    </div>
                )}
            </div>

            {/* ── Funding Pipeline ── */}
            <div className={fundingStyles.section} style={{ marginTop: '2rem' }}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Funding Pipeline</h3>
                    <div className={fundingStyles.filterRow}>
                        <Filter size={14} style={{ opacity: 0.4 }} />
                        <select
                            className={fundingStyles.filterSelect}
                            value={pipelineFilter}
                            onChange={(e) => setPipelineFilter(e.target.value as FundingStatus | 'all')}
                        >
                            <option value="all">All ({opportunities.length})</option>
                            {(Object.keys(pipelineCounts) as FundingStatus[]).map(status => (
                                pipelineCounts[status] > 0 && (
                                    <option key={status} value={status}>
                                        {STATUS_LABELS[status]} ({pipelineCounts[status]})
                                    </option>
                                )
                            ))}
                        </select>
                    </div>
                </div>

                {/* Pipeline stage indicators */}
                <div className={fundingStyles.pipelineStages}>
                    {(['discovered', 'evaluating', 'drafting', 'ready-for-review', 'submitted', 'approved'] as FundingStatus[]).map(stage => (
                        <button
                            key={stage}
                            className={`${fundingStyles.stageChip} ${pipelineFilter === stage ? fundingStyles.stageChipActive : ''}`}
                            onClick={() => setPipelineFilter(pipelineFilter === stage ? 'all' : stage)}
                            style={{ '--stage-color': STATUS_COLORS[stage] } as React.CSSProperties}
                        >
                            <span
                                className={fundingStyles.stageDot}
                                style={{ background: STATUS_COLORS[stage] }}
                            />
                            {STATUS_LABELS[stage]}
                            <span className={fundingStyles.stageCount}>{pipelineCounts[stage]}</span>
                        </button>
                    ))}
                </div>

                {/* Opportunity cards */}
                <div className={fundingStyles.opportunityGrid}>
                    {filteredOpportunities.map(opp => (
                        <div key={opp.id} className={fundingStyles.oppCard}>
                            <div className={fundingStyles.oppHeader}>
                                <div>
                                    <span
                                        className={fundingStyles.oppCategory}
                                        style={{ color: STATUS_COLORS[opp.status] }}
                                    >
                                        {CATEGORY_LABELS[opp.category]}
                                    </span>
                                    <h4 className={fundingStyles.oppName}>{opp.name}</h4>
                                    <span className={fundingStyles.oppProvider}>
                                        {opp.provider} &middot; {opp.country}
                                        {opp.province && ` (${opp.province})`}
                                    </span>
                                </div>
                                <div className={fundingStyles.oppAmount}>
                                    ${(opp.maxAmount / 1000).toFixed(0)}K
                                </div>
                            </div>

                            <p className={fundingStyles.oppDescription}>{opp.description}</p>

                            {/* Eligibility bar */}
                            <div className={fundingStyles.eligibilityRow}>
                                <span className={fundingStyles.eligibilityLabel}>Eligibility</span>
                                <div className={fundingStyles.eligibilityBar}>
                                    <div
                                        className={fundingStyles.eligibilityFill}
                                        style={{
                                            width: `${opp.eligibilityScore}%`,
                                            background: opp.eligibilityScore >= 80 ? '#10b981' :
                                                opp.eligibilityScore >= 60 ? '#f59e0b' : '#ef4444',
                                        }}
                                    />
                                </div>
                                <span className={fundingStyles.eligibilityScore}>{opp.eligibilityScore}%</span>
                            </div>

                            {/* AI Notes */}
                            <div className={fundingStyles.aiNote}>
                                <Sparkles size={14} />
                                <span>{opp.aiNotes}</span>
                            </div>

                            <div className={fundingStyles.oppFooter}>
                                <span
                                    className={fundingStyles.oppStatus}
                                    style={{ color: STATUS_COLORS[opp.status] }}
                                >
                                    {STATUS_LABELS[opp.status]}
                                </span>
                                <div className={fundingStyles.oppActions}>
                                    {opp.deadline && (
                                        <span className={fundingStyles.oppDeadline}>
                                            <Clock size={12} /> {opp.deadline}
                                        </span>
                                    )}
                                    <a
                                        href={opp.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={fundingStyles.oppLink}
                                    >
                                        <Eye size={14} /> Details <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
