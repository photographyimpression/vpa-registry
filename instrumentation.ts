// Next.js boot hook — runs once per server start, before any request is served.
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { validateEnv } = await import('./src/lib/env-check');
        validateEnv();
    }
}
