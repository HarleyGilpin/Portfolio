import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

import { sql } from '@vercel/postgres';
import handler from '../../api/posts.js';

function createMockReqRes(method = 'GET', body = {}, headers = {}) {
    return {
        req: { method, body, headers },
        res: {
            statusCode: null,
            body: null,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; },
        },
    };
}

describe('/api/posts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET — works without authentication', async () => {
        sql.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Test' }] });

        const { req, res } = createMockReqRes('GET');
        await handler(req, res);
        expect(res.statusCode).toBe(200);
    });

    it('POST — requires session token', async () => {
        const { req, res } = createMockReqRes('POST', {
            title: 'New Post',
            slug: 'new-post',
        });
        // No x-admin-auth header
        await handler(req, res);
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Unauthorized');
    });

    it('POST — rejects invalid session tokens', async () => {
        // Mock session lookup returning empty (invalid token)
        sql.mockResolvedValueOnce({ rows: [] }); // sessions table create
        sql.mockResolvedValueOnce({ rows: [] }); // expired session cleanup
        sql.mockResolvedValueOnce({ rows: [] }); // session lookup (not found)

        const { req, res } = createMockReqRes('POST', {
            title: 'New Post',
            slug: 'new-post',
        }, { 'x-admin-auth': 'invalid-token-that-is-at-least-32-chars-long' });
        await handler(req, res);
        expect(res.statusCode).toBe(401);
    });

    it('error responses do not leak internal details', async () => {
        // Reset any queued mock implementations from prior tests
        sql.mockReset();
        // Simulate a database error during GET
        sql.mockImplementation(() => Promise.reject(new Error('connection refused')));

        const { req, res } = createMockReqRes('GET');
        await handler(req, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toBe('Internal server error');
        expect(JSON.stringify(res.body)).not.toContain('connection refused');
    });
});
