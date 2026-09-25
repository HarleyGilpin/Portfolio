import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

import { sql } from '@vercel/postgres';
import { rateLimit } from '../../api/_utils/rate-limit.js';

let ipCounter = 0;
const request = () => ({ headers: { 'x-forwarded-for': `198.51.100.${++ipCounter}` } });

describe('rateLimit (Postgres-backed)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('allows requests under the limit', async () => {
        sql.mockResolvedValue({ rows: [{ count: 3, reset_at: new Date(Date.now() + 60_000) }] });
        const result = await rateLimit(request(), { maxRequests: 5, keyPrefix: 'test' });
        expect(result).toEqual({ limited: false, remaining: 2 });
    });

    it('blocks requests over the limit using the shared counter', async () => {
        sql.mockResolvedValue({ rows: [{ count: 6, reset_at: new Date(Date.now() + 30_000) }] });
        const result = await rateLimit(request(), { maxRequests: 5, keyPrefix: 'test' });
        expect(result.limited).toBe(true);
        expect(result.status).toBe(429);
        expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it('increments atomically, keyed by prefix and client IP', async () => {
        sql.mockResolvedValue({ rows: [{ count: 1, reset_at: new Date() }] });
        await rateLimit({ headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } }, { keyPrefix: 'login' });

        const upsert = sql.mock.calls.find(call => call[0].join('').includes('INSERT INTO rate_limits'));
        expect(upsert[0].join('')).toContain('rate_limits.count + 1');
        expect(upsert).toContain('login:203.0.113.9');
    });

    it('falls back to the in-memory limiter when the database is down', async () => {
        sql.mockRejectedValue(new Error('connection refused'));
        const req = request();

        for (let i = 0; i < 2; i++) {
            expect((await rateLimit(req, { maxRequests: 2, keyPrefix: 'fallback' })).limited).toBe(false);
        }
        expect((await rateLimit(req, { maxRequests: 2, keyPrefix: 'fallback' })).limited).toBe(true);
    });
});
