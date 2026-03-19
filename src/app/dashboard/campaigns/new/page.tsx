"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import styles from '../Campaigns.module.css';

const INDUSTRIES = [
    'Jewelry',
    'Electronics',
    'Fashion',
    'Food & Beverage',
    'Health & Beauty',
    'Other',
];

const CITY_SUGGESTIONS = [
    'Montreal',
    'Toronto',
    'Vancouver',
    'Calgary',
    'Ottawa',
    'Edmonton',
    'Winnipeg',
    'Quebec City',
    'Halifax',
    'Victoria',
];

const COUNTRIES = [
    'Canada',
    'United States',
    'United Kingdom',
    'France',
    'Germany',
    'Australia',
    'Other',
];

export default function NewCampaignPage() {
    const { status: authStatus } = useSession();
    const router = useRouter();

    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Canada');
    const [dailyLimit, setDailyLimit] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = CITY_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(city.toLowerCase()) && city.length > 0
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !industry || !city.trim()) {
            setErrorMsg('Please fill in all required fields.');
            return;
        }

        setSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    industry,
                    city: city.trim(),
                    country,
                    dailyLimit,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to create campaign');
            }

            const campaign = await res.json();
            router.push(`/dashboard/campaigns/${campaign.id}`);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authStatus === 'loading') {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
            <Link href="/dashboard/campaigns" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Campaigns
            </Link>

            <div className={styles.formPanel}>
                <h1 className={styles.formTitle}>Create Campaign</h1>
                <p className={styles.formSubtitle}>
                    Set up a new outreach campaign targeting local businesses.
                </p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="campaign-name">Campaign Name</label>
                        <input
                            id="campaign-name"
                            type="text"
                            placeholder="e.g. Montreal Jewelers Q1 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="campaign-industry">Industry</label>
                        <select
                            id="campaign-industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select an industry</option>
                            {INDUSTRIES.map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup} style={{ position: 'relative' }}>
                            <label htmlFor="campaign-city">City</label>
                            <input
                                id="campaign-city"
                                type="text"
                                placeholder="e.g. Montreal"
                                value={city}
                                onChange={(e) => {
                                    setCity(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                required
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'white',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    boxShadow: 'var(--shadow-md)',
                                    zIndex: 10,
                                    maxHeight: '180px',
                                    overflowY: 'auto',
                                }}>
                                    {filteredSuggestions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '0.65rem 1rem',
                                                textAlign: 'left',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontFamily: 'var(--font-sans)',
                                            }}
                                            onMouseDown={() => {
                                                setCity(s);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="campaign-country">Country</label>
                            <select
                                id="campaign-country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            >
                                {COUNTRIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="campaign-daily-limit">Daily Send Limit</label>
                        <input
                            id="campaign-daily-limit"
                            type="number"
                            min={1}
                            max={100}
                            value={dailyLimit}
                            onChange={(e) => setDailyLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                    </div>

                    {errorMsg && (
                        <p className={styles.errorMessage}>{errorMsg}</p>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <><Loader2 size={18} className={styles.spinner} /> Creating...</>
                        ) : (
                            <>Create Campaign <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}
