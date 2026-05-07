import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Lightweight health check. The boot-time env validator (instrumentation.ts →
 * src/lib/env-check.ts) refuses to start the server in production if any
 * required env var is missing, so reaching this endpoint at all already implies
 * the env is valid. Used by uptime monitors and post-deploy smoke tests.
 */
export async function GET() {
    return NextResponse.json({
        ok: true,
        ts: new Date().toISOString(),
        env: process.env.NODE_ENV ?? 'unknown',
    });
}
