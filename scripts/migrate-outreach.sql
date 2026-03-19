-- migrate-outreach.sql
-- Adds outreach tables to the existing n8n PostgreSQL database (Cloud SQL: vpa-n8n-db)
-- Safe to run multiple times thanks to IF NOT EXISTS guards.

BEGIN;

-- =============================================================================
-- 1. Trigger function: auto-update updated_at columns
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 2. campaigns
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    industry        VARCHAR(100) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    country         VARCHAR(100) DEFAULT 'Canada',
    status          VARCHAR(20)  DEFAULT 'draft'
                        CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    daily_limit     INTEGER      DEFAULT 1,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. prospects
-- =============================================================================
CREATE TABLE IF NOT EXISTS prospects (
    id                  SERIAL PRIMARY KEY,
    campaign_id         INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    business_name       VARCHAR(255) NOT NULL,
    website             VARCHAR(500),
    email               VARCHAR(255),
    product_page_urls   JSONB        DEFAULT '[]',
    city                VARCHAR(100),
    industry            VARCHAR(100),
    status              VARCHAR(30)  DEFAULT 'scraped'
                            CHECK (status IN (
                                'scraped', 'screenshot_taken', 'email_pending',
                                'emailed', 'opened', 'clicked', 'signed_up',
                                'integrated', 'unsubscribed', 'bounced'
                            )),
    tier                VARCHAR(10)  DEFAULT 'free'
                            CHECK (tier IN ('free', 'paid')),
    token               UUID         DEFAULT gen_random_uuid() UNIQUE,
    preview_image_url   TEXT,
    before_image_url    TEXT,
    emailed_at          TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ,
    clicked_at          TIMESTAMPTZ,
    signed_up_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- =============================================================================
-- 4. email_events
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_events (
    id              SERIAL PRIMARY KEY,
    prospect_id     INTEGER REFERENCES prospects(id) ON DELETE CASCADE,
    event_type      VARCHAR(20) NOT NULL
                        CHECK (event_type IN ('sent', 'opened', 'clicked', 'unsubscribed', 'bounced')),
    metadata        JSONB       DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. integrations
-- =============================================================================
CREATE TABLE IF NOT EXISTS integrations (
    id                  SERIAL PRIMARY KEY,
    user_email          VARCHAR(255) NOT NULL,
    platform            VARCHAR(20)  NOT NULL
                            CHECK (platform IN ('shopify', 'woocommerce', 'snippet')),
    store_url           VARCHAR(500) NOT NULL,
    credentials         JSONB        DEFAULT '{}',
    status              VARCHAR(20)  DEFAULT 'connected'
                            CHECK (status IN ('connected', 'processing', 'active', 'disconnected', 'error')),
    original_images     JSONB        DEFAULT '[]',
    processed_count     INTEGER      DEFAULT 0,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_integrations_updated_at ON integrations;
CREATE TRIGGER trg_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_prospects_campaign_id ON prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_prospects_token       ON prospects(token);
CREATE INDEX IF NOT EXISTS idx_prospects_status      ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_email       ON prospects(email);

CREATE INDEX IF NOT EXISTS idx_email_events_prospect_id ON email_events(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type  ON email_events(event_type);

CREATE INDEX IF NOT EXISTS idx_integrations_user_email ON integrations(user_email);

COMMIT;
