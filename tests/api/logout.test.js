import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

import { sql } from '@vercel/postgres';
import handler from '../../api/logout.js';

function createMockReqRes(method = 'POST', headers = {}) {
    return {
        req: { 
            method, 
            headers: {
                origin: 'https://harleygilpin.com',
                ...headers
            } 
        },
        res: {
            statusCode: null,
            body: null,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; },
            setHeader: vi.fn(), // Mock the cookie setter
        },
    };
}

describe('POST /api/logout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sql.mockResolvedValue({ rowCount: 1 });
    });

    it('rejects non-POST methods', async () => {
        const { req, res } = createMockReqRes('GET');
        await handler(req, res);
        expect(res.statusCode).toBe(405);
    });

    it('returns 400 when no token is provided', async () => {
        const { req, res } = createMockReqRes('POST');
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('No token provided');
    });

    it('returns success when a valid token is provided', async () => {
        const { req, res } = createMockReqRes('POST', {
            'cookie': `sessionToken=${'a'.repeat(64)}`,
        });
        await handler(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('returns success even for invalid tokens (no information leak)', async () => {
        sql.mockResolvedValue({ rowCount: 0 }); // Token doesn't exist
        const { req, res } = createMockReqRes('POST', {
            'cookie': `sessionToken=${'b'.repeat(64)}`,
        });
        await handler(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true); // Always returns success
    });
});
