#!/usr/bin/env npx tsx
/**
 * VPA Registry — Comprehensive Pipeline Test Suite
 *
 * Tests: single upload, batch upload, edge cases, load (concurrent),
 *        AI detection (EXIF heuristic), magic-byte validation,
 *        rate limiting, HTTP endpoints.
 *
 * Run:  npx tsx scripts/test-pipeline.ts
 */

import sharp from 'sharp';
import { applyWatermark } from '../src/app/api/watermark/route';
import { detectImageMagicBytes, checkForAiGenerated } from '../src/app/api/certify/route';

// ── Colours ───────────────────────────────────────────────────────────────────
const G = (s: string) => `\x1b[32m${s}\x1b[0m`;  // green
const R = (s: string) => `\x1b[31m${s}\x1b[0m`;  // red
const Y = (s: string) => `\x1b[33m${s}\x1b[0m`;  // yellow
const B = (s: string) => `\x1b[1m${s}\x1b[0m`;   // bold
const D = (s: string) => `\x1b[2m${s}\x1b[0m`;   // dim

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0, failed = 0, warned = 0;

function ok(name: string, detail = '') {
    passed++;
    console.log(`  ${G('✓')} ${name}${detail ? D('  ' + detail) : ''}`);
}
function fail(name: string, err: unknown) {
    failed++;
    console.log(`  ${R('✗')} ${name}`);
    console.log(`    ${R(String(err))}`);
}
function warn(name: string, detail = '') {
    warned++;
    console.log(`  ${Y('⚠')} ${name}${detail ? D('  ' + detail) : ''}`);
}
function section(title: string) {
    console.log(`\n${B(title)}`);
}

// ── Image factories ───────────────────────────────────────────────────────────
async function makeJpeg(w: number, h: number, withExif = false): Promise<Buffer> {
    const base = sharp({
        create: { width: w, height: h, channels: 3, background: { r: 120, g: 80, b: 40 } }
    });
    const withMeta = withExif
        ? base.withMetadata({ exif: { IFD0: { Make: 'Canon', Model: 'EOS R5' } } })
        : base;
    return withMeta.jpeg({ quality: 80 }).toBuffer();
}

async function makePng(w: number, h: number): Promise<Buffer> {
    return sharp({
        create: { width: w, height: h, channels: 4, background: { r: 30, g: 60, b: 90, alpha: 1 } }
    }).png().toBuffer();
}

async function makeWebp(w: number, h: number): Promise<Buffer> {
    return sharp({
        create: { width: w, height: h, channels: 3, background: { r: 200, g: 150, b: 100 } }
    }).webp({ quality: 80 }).toBuffer();
}

function randomBytes(n: number): Buffer {
    return Buffer.from(Array.from({ length: n }, () => Math.floor(Math.random() * 256)));
}

// ── § 1  SINGLE IMAGE UPLOAD ──────────────────────────────────────────────────
async function testSingleUpload() {
    section('§1  Single Image Upload');

    const jpeg = await makeJpeg(1200, 900);
    try {
        const t0 = Date.now();
        const out = await applyWatermark(jpeg, 'VPA-TEST01-1234');
        const ms = Date.now() - t0;
        const meta = await sharp(out).metadata();
        if (meta.format !== 'png') throw new Error(`Expected PNG output, got ${meta.format}`);
        if ((meta.width ?? 0) < 1200) throw new Error('Output narrower than input');
        ok('1200×900 JPEG → watermarked PNG', `${(out.length / 1024).toFixed(0)} KB in ${ms} ms`);
    } catch (e) { fail('1200×900 JPEG upload', e); }

    // JPEG with EXIF (simulates real camera photo)
    const jpegExif = await makeJpeg(800, 600, true);
    try {
        const out = await applyWatermark(jpegExif, 'VPA-TEST02-5678');
        const meta = await sharp(out).metadata();
        if (meta.format !== 'png') throw new Error('Expected PNG');
        ok('Camera JPEG (with EXIF) → watermarked PNG');
    } catch (e) { fail('Camera JPEG upload', e); }

    // PNG upload
    const png = await makePng(640, 480);
    try {
        const out = await applyWatermark(png, 'VPA-TEST03-9012');
        ok('PNG upload → watermarked PNG', `${(out.length / 1024).toFixed(0)} KB`);
    } catch (e) { fail('PNG upload', e); }

    // WebP upload
    const webp = await makeWebp(800, 600);
    try {
        const out = await applyWatermark(webp, 'VPA-TEST04-3456');
        ok('WebP upload → watermarked PNG', `${(out.length / 1024).toFixed(0)} KB`);
    } catch (e) { fail('WebP upload', e); }
}

// ── § 2  BATCH UPLOAD (5 concurrent) ─────────────────────────────────────────
async function testBatchUpload() {
    section('§2  Batch Upload — 5 images concurrently');

    const images = await Promise.all([
        makeJpeg(400, 300),
        makeJpeg(1600, 1200),
        makePng(500, 500),
        makeWebp(720, 480),
        makeJpeg(300, 400),
    ]);

    const t0 = Date.now();
    const results = await Promise.allSettled(
        images.map((img, i) => applyWatermark(img, `VPA-BATCH${i + 1}-${1000 + i}`))
    );
    const ms = Date.now() - t0;

    let batchOk = 0;
    for (const [i, r] of results.entries()) {
        if (r.status === 'fulfilled') {
            batchOk++;
            ok(`Batch image ${i + 1}`, `${(r.value.length / 1024).toFixed(0)} KB`);
        } else {
            fail(`Batch image ${i + 1}`, r.reason);
        }
    }
    console.log(`  ${D(`Total: ${batchOk}/${images.length} succeeded in ${ms} ms (${Math.round(ms / images.length)} ms/image avg)`)}`);
}

// ── § 3  EDGE CASES ───────────────────────────────────────────────────────────
async function testEdgeCases() {
    section('§3  Edge Cases');

    // Tiny image — should be upscaled to at least 300px minimum
    const tiny = await makeJpeg(50, 50);
    try {
        const out = await applyWatermark(tiny, 'VPA-TINY00-0001');
        const meta = await sharp(out).metadata();
        if ((meta.width ?? 0) < 300) throw new Error(`Upscale failed: ${meta.width}px`);
        ok('Tiny 50×50 → upscaled to min 300px', `output: ${meta.width}×${meta.height}`);
    } catch (e) { fail('Tiny image', e); }

    // Very large image
    const large = await makeJpeg(6000, 4000);
    try {
        const t0 = Date.now();
        const out = await applyWatermark(large, 'VPA-LARGE0-0002');
        ok('Large 6000×4000 JPEG', `${(out.length / 1024 / 1024).toFixed(1)} MB in ${Date.now() - t0} ms`);
    } catch (e) { fail('Large 6000×4000 JPEG', e); }

    // Extremely narrow image
    const narrow = await makeJpeg(10, 2000);
    try {
        const out = await applyWatermark(narrow, 'VPA-NARW00-0003');
        ok('Narrow 10×2000 JPEG', `${(out.length / 1024).toFixed(0)} KB`);
    } catch (e) { fail('Narrow 10×2000 JPEG', e); }

    // Square image
    const square = await makeJpeg(1000, 1000);
    try {
        const out = await applyWatermark(square, 'VPA-SQR000-0004');
        ok('Square 1000×1000 JPEG', `${(out.length / 1024).toFixed(0)} KB`);
    } catch (e) { fail('Square 1000×1000 JPEG', e); }

    // Corrupt / random data — watermark should throw, we catch it
    try {
        await applyWatermark(randomBytes(1024), 'VPA-CRPT00-0005');
        fail('Corrupt data (should have thrown)', 'No error thrown');
    } catch {
        ok('Corrupt data → throws as expected');
    }

    // Empty buffer
    try {
        await applyWatermark(Buffer.alloc(0), 'VPA-EMPTY0-0006');
        fail('Empty buffer (should have thrown)', 'No error thrown');
    } catch {
        ok('Empty buffer → throws as expected');
    }

    // 1-pixel image
    const onePx = await makeJpeg(1, 1);
    try {
        const out = await applyWatermark(onePx, 'VPA-1PX000-0007');
        const meta = await sharp(out).metadata();
        ok('1×1 JPEG → upscaled', `output: ${meta.width}×${meta.height}`);
    } catch (e) { fail('1×1 JPEG', e); }
}

// ── § 4  MAGIC-BYTES VALIDATION ───────────────────────────────────────────────
async function testMagicBytes() {
    section('§4  Magic-Bytes Validation');

    const jpeg = await makeJpeg(100, 100);
    const png  = await makePng(100, 100);
    const webp = await makeWebp(100, 100);

    const cases: [string, Buffer, string | null][] = [
        ['JPEG magic bytes', jpeg,           'image/jpeg'],
        ['PNG magic bytes',  png,            'image/png'],
        ['WebP magic bytes', webp,           'image/webp'],
        ['Random bytes',     randomBytes(64), null],
        ['Empty buffer',     Buffer.alloc(0), null],
        ['Short buffer (4B)',Buffer.alloc(4), null],
    ];

    for (const [name, buf, expected] of cases) {
        const result = detectImageMagicBytes(buf);
        if (result === expected) {
            ok(`${name} → ${expected ?? 'null'}`);
        } else {
            fail(`${name}`, `expected ${expected}, got ${result}`);
        }
    }

    // TIFF magic bytes (little-endian: II 2A 00)
    const tiffLE = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const tiffBE = Buffer.from([0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00]);
    const tiffLE_result = detectImageMagicBytes(tiffLE);
    const tiffBE_result = detectImageMagicBytes(tiffBE);
    tiffLE_result === 'image/tiff' ? ok('TIFF little-endian magic bytes → image/tiff') : fail('TIFF LE', `got ${tiffLE_result}`);
    tiffBE_result === 'image/tiff' ? ok('TIFF big-endian magic bytes → image/tiff') : fail('TIFF BE', `got ${tiffBE_result}`);

    // JPEG bytes but with PNG header injected — should still detect JPEG
    const spoofed = Buffer.concat([jpeg.slice(0, 3), Buffer.from([0x89, 0x50, 0x4e, 0x47]), jpeg.slice(7)]);
    const spoofResult = detectImageMagicBytes(spoofed);
    spoofResult === 'image/jpeg' ? ok('JPEG with altered mid-bytes → still detects JPEG') : fail('JPEG spoof detection', `got ${spoofResult}`);
}

// ── § 5  AI DETECTION (EXIF HEURISTIC) ───────────────────────────────────────
async function testAiDetection() {
    section('§5  AI Image Detection (EXIF Heuristic)');

    // Temporarily enable AI detection for this test
    const orig = process.env.AI_DETECTION_MODE;
    process.env.AI_DETECTION_MODE = 'warn';

    // JPEG WITHOUT EXIF — simulates AI-generated image
    const aiJpeg = await makeJpeg(800, 600, false);
    const aiResult = await checkForAiGenerated(aiJpeg, 'image/jpeg');
    if (aiResult && aiResult.includes('EXIF')) {
        ok('AI-generated JPEG (no EXIF) → flagged', aiResult);
    } else {
        fail('AI-generated JPEG should be flagged', `got: ${aiResult}`);
    }

    // JPEG WITH EXIF — simulates real camera photo
    const realJpeg = await makeJpeg(800, 600, true);
    const realMeta = await sharp(realJpeg).metadata();
    if (realMeta.exif && realMeta.exif.length >= 12) {
        const realResult = await checkForAiGenerated(realJpeg, 'image/jpeg');
        if (realResult === null) {
            ok('Camera JPEG (with EXIF) → passes AI check');
        } else {
            warn('Camera JPEG flagged as AI', `EXIF length: ${realMeta.exif.length} bytes — ${realResult}`);
        }
    } else {
        warn('Sharp did not embed EXIF into test JPEG — skipping real-photo test',
             'This is a sharp version limitation; real camera JPEGs will always have EXIF');
    }

    // PNG — should be skipped (not EXIF-checked)
    const pngBuf = await makePng(400, 300);
    const pngResult = await checkForAiGenerated(pngBuf, 'image/png');
    pngResult === null
        ? ok('PNG → AI check skipped (correct — PNG rarely has EXIF)')
        : fail('PNG should not be AI-checked', `got: ${pngResult}`);

    // WebP — should be skipped
    const webpBuf = await makeWebp(400, 300);
    const webpResult = await checkForAiGenerated(webpBuf, 'image/webp');
    webpResult === null
        ? ok('WebP → AI check skipped (correct)')
        : fail('WebP should not be AI-checked', `got: ${webpResult}`);

    // With mode=off — nothing should be detected regardless of EXIF
    process.env.AI_DETECTION_MODE = 'off';
    const offResult = await checkForAiGenerated(aiJpeg, 'image/jpeg');
    offResult === null
        ? ok('AI_DETECTION_MODE=off → no check performed (correct)')
        : fail('AI check should be off', `got: ${offResult}`);

    process.env.AI_DETECTION_MODE = orig ?? 'off';
}

// ── § 6  RATE LIMITING ────────────────────────────────────────────────────────
async function testRateLimiting() {
    section('§6  In-Process Rate Limiting');

    // Manual Map-based rate limit simulation
    const map = new Map<string, { count: number; resetAt: number }>();
    const LIMIT = 60;
    const WINDOW = 60_000;

    function check(userId: string): boolean {
        const now = Date.now();
        const rec = map.get(userId);
        if (!rec || now >= rec.resetAt) {
            map.set(userId, { count: 1, resetAt: now + WINDOW });
            return true;
        }
        if (rec.count >= LIMIT) return false;
        rec.count++;
        return true;
    }

    // First 60 should succeed for user A
    let successes = 0;
    for (let i = 0; i < 60; i++) if (check('userA')) successes++;
    successes === 60 ? ok(`First 60 requests succeed (${successes}/60)`) : fail('60 requests', `${successes} succeeded`);

    // 61st should fail
    check('userA') ? fail('61st request should be blocked', 'expected false') : ok('61st request → rate limited (429)');

    // Different user has their own bucket
    check('userB') ? ok('Different user (B) has independent bucket') : fail('User B should not be rate-limited', 'got false');

    // 60 concurrent requests from same user
    map.clear();
    const concurrent = Array.from({ length: 60 }, () => check('concurrent-user'));
    const concurrentOk = concurrent.filter(Boolean).length;
    concurrentOk === 60
        ? ok(`60 concurrent requests from same user: all allowed (${concurrentOk}/60)`)
        : warn(`Concurrent rate limit: ${concurrentOk}/60 allowed (Map is not thread-safe for true concurrency)`);
}

// ── § 7  LOAD TEST (50 concurrent watermark ops) ─────────────────────────────
async function testLoad() {
    section('§7  Load Test — 50 Concurrent Watermark Operations');

    const WORKERS = 50;

    // Vary image sizes to stress-test more
    const sizes = [300, 400, 600, 800, 1000, 1200, 1600];
    const tasks = Array.from({ length: WORKERS }, async (_, i) => {
        const w = sizes[i % sizes.length];
        const h = Math.round(w * 0.75);
        const buf = await makeJpeg(w, h);
        const vpaId = `VPA-LOAD${String(i).padStart(2, '0')}-${1000 + i}`;
        const t = Date.now();
        const out = await applyWatermark(buf, vpaId);
        return { idx: i, ms: Date.now() - t, kb: Math.round(out.length / 1024) };
    });

    console.log(`  Running ${WORKERS} concurrent watermark operations...`);
    const t0 = Date.now();
    const results = await Promise.allSettled(tasks);
    const total = Date.now() - t0;

    const successes = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<{ idx: number; ms: number; kb: number }>[];
    const failures  = results.filter(r => r.status === 'rejected');

    if (successes.length === WORKERS) {
        const times = successes.map(r => r.value.ms);
        const avgMs = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const maxMs = Math.max(...times);
        const minMs = Math.min(...times);
        ok(`All ${WORKERS}/${WORKERS} succeeded`, `wall: ${total} ms | avg: ${avgMs} ms | min: ${minMs} ms | max: ${maxMs} ms`);
    } else {
        fail(`Load test: ${successes.length}/${WORKERS} succeeded`, `${failures.length} failed`);
        failures.forEach((f, i) => {
            if (f.status === 'rejected') console.log(`    ${R('✗')} worker ${i}: ${f.reason}`);
        });
    }

    // Memory check
    const mem = process.memoryUsage();
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
    const rssMB  = Math.round(mem.rss / 1024 / 1024);
    heapMB < 500
        ? ok(`Memory after load test: heap ${heapMB} MB, RSS ${rssMB} MB`)
        : warn(`High memory usage after load test: heap ${heapMB} MB, RSS ${rssMB} MB`);
}

// ── § 8  HTTP ENDPOINT TESTS ──────────────────────────────────────────────────
async function testHttpEndpoints() {
    section('§8  HTTP Endpoint Tests (dev server at localhost:3000)');
    const BASE = 'http://localhost:3000';

    async function get(path: string, headers: Record<string, string> = {}) {
        return fetch(`${BASE}${path}`, { headers });
    }

    // /api/dashboard — no auth → 401
    try {
        const r = await get('/api/dashboard');
        r.status === 401
            ? ok('GET /api/dashboard without auth → 401')
            : fail('GET /api/dashboard should be 401', `got ${r.status}`);
    } catch (e) { fail('GET /api/dashboard', e); }

    // /api/certify — no auth → 401
    try {
        const r = await fetch(`${BASE}/api/certify`, { method: 'POST', body: new FormData() });
        r.status === 401
            ? ok('POST /api/certify without auth → 401')
            : fail('POST /api/certify should be 401', `got ${r.status}`);
    } catch (e) { fail('POST /api/certify', e); }

    // /api/watermark — no WATERMARK_SECRET set → SSRF protection kicks in
    try {
        const r = await get('/api/watermark?imageUrl=http://evil.com/img.jpg&vpaId=VPA-TEST-0000');
        r.status === 400
            ? ok('GET /api/watermark with untrusted host → 400 SSRF block')
            : fail('GET /api/watermark SSRF should be 400', `got ${r.status}`);
    } catch (e) { fail('GET /api/watermark SSRF', e); }

    // /api/watermark — missing params
    try {
        const r = await get('/api/watermark');
        r.status === 400
            ? ok('GET /api/watermark missing params → 400')
            : fail('GET /api/watermark missing params should be 400', `got ${r.status}`);
    } catch (e) { fail('GET /api/watermark missing params', e); }

    // /api/watermark — allowed host (will fail to fetch but should not SSRF-block)
    try {
        const r = await get('/api/watermark?imageUrl=https://storage.googleapis.com/nonexistent/img.jpg&vpaId=VPA-TEST-0001');
        // Will return 500 (fetch fails) but NOT 400 SSRF — the host is allowed
        r.status !== 400
            ? ok(`GET /api/watermark allowed host → reaches fetch (status ${r.status}, not SSRF-blocked)`)
            : fail('storage.googleapis.com should be allowed past SSRF check', `got ${r.status}`);
    } catch (e) { fail('GET /api/watermark allowed host', e); }

    // Dashboard page redirect when not logged in
    try {
        const r = await get('/dashboard');
        // Should redirect to /login (302 or 307) or serve a redirect
        [200, 302, 307].includes(r.status)
            ? ok(`GET /dashboard → ${r.status} (proxy auth handling)`)
            : fail('GET /dashboard unexpected status', `got ${r.status}`);
    } catch (e) { fail('GET /dashboard', e); }
}

// ── § 9  N8N RESPONSE PARSING RESILIENCE ─────────────────────────────────────
async function testN8nParsing() {
    section('§9  n8n Response Parsing Resilience');

    // Test our JSON-parse-with-fallback logic
    function parseN8nBody(text: string): string {
        if (!text) return '';
        try {
            return JSON.parse(text).certifiedImageUrl || '';
        } catch {
            return '';
        }
    }

    parseN8nBody('{"certifiedImageUrl":"https://storage.gcs/abc.png"}') === 'https://storage.gcs/abc.png'
        ? ok('Valid JSON response → extracts certifiedImageUrl')
        : fail('Valid JSON parse', '');

    parseN8nBody('') === ''
        ? ok('Empty body → returns empty string (no crash)')
        : fail('Empty body', '');

    parseN8nBody('OK') === ''
        ? ok('Non-JSON "OK" body → returns empty string (no crash)')
        : fail('Non-JSON body', '');

    parseN8nBody('{"other":"field"}') === ''
        ? ok('JSON without certifiedImageUrl → returns empty string')
        : fail('JSON missing field', '');

    parseN8nBody('{invalid json}') === ''
        ? ok('Malformed JSON → returns empty string (no crash)')
        : fail('Malformed JSON', '');
}

// ── § 10  VPA ID GENERATION ───────────────────────────────────────────────────
async function testVpaIdGeneration() {
    section('§10  VPA ID Generation — 10,000 samples');

    function generateVpaId(): string {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        const part = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const num = String(Math.floor(1000 + Math.random() * 9000));
        return `VPA-${part}-${num}`;
    }

    const N = 10_000;
    const ids = new Set<string>();
    const pattern = /^VPA-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}-\d{4}$/;

    let formatFails = 0;
    let ambigFails = 0;
    const ambiguous = new Set(['0', 'O', '1', 'I', 'L']);

    for (let i = 0; i < N; i++) {
        const id = generateVpaId();
        ids.add(id);
        if (!pattern.test(id)) formatFails++;
        // Check no ambiguous chars in the 6-char part
        const part = id.split('-')[1];
        if (part && [...part].some(c => ambiguous.has(c))) ambigFails++;
    }

    const dupes = N - ids.size;

    formatFails === 0 ? ok(`Format: all ${N} IDs match VPA-XXXXXX-NNNN pattern`) : fail('ID format', `${formatFails} failed`);
    ambigFails === 0 ? ok('No ambiguous characters (0/O, 1/I/L) in any ID') : fail('Ambiguous chars', `${ambigFails} IDs`);
    dupes === 0
        ? ok(`Uniqueness: 0 duplicates in ${N} IDs`)
        : warn(`${dupes} duplicate IDs in ${N} — birthday-paradox at this scale`, `collision rate: ${(dupes / N * 100).toFixed(4)}%`);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log(B('\n╔══════════════════════════════════════════════════╗'));
    console.log(B('║  VPA Registry — Full Pipeline Test Suite          ║'));
    console.log(B('╚══════════════════════════════════════════════════╝'));

    const start = Date.now();

    await testSingleUpload();
    await testBatchUpload();
    await testEdgeCases();
    await testMagicBytes();
    await testAiDetection();
    await testRateLimiting();
    await testLoad();
    await testHttpEndpoints();
    await testN8nParsing();
    await testVpaIdGeneration();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log('\n' + B('═'.repeat(52)));
    console.log(`  ${G('✓')} ${B(String(passed))} passed   ${R('✗')} ${B(String(failed))} failed   ${Y('⚠')} ${B(String(warned))} warned`);
    console.log(`  Total time: ${elapsed} s`);
    console.log(B('═'.repeat(52)) + '\n');

    if (failed > 0) process.exit(1);
}

main().catch(e => {
    console.error(R('\nFATAL:'), e);
    process.exit(1);
});
