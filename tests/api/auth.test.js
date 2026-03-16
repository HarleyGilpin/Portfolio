import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

// Mock crypto for deterministic testing
vi.mock('crypto', async () => {
    const actual = await vi.importActual('crypto');
    return {
        ...actual,
        randomBytes: vi.fn(() => Buffer.from('a'.repeat(32))),
    };
});

import { sql } from '@vercel/postgres';
import handler from '../../api/login.js';

// Helper to create mock req/res
function createMockReqRes(method = 'POST', body = {}, headers = {}) {
    const req = {
        method,
        body,
        headers: {
            'x-forwarded-for': '127.0.0.1',
            origin: 'https://harleygilpin.com',
            ...headers,
        },
        socket: { remoteAddress: '127.0.0.1' },
    };

    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        },
        setHeader: vi.fn(),
    };

    return { req, res };
}

describe('POST /api/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.ADMIN_PASSWORD = 'test-secret-password';

        // Default: no login attempts on record
        sql.mockResolvedValue({ rows: [] });
    });

    it('rejects non-POST methods', async () => {
        const { req, res } = createMockReqRes('GET');
        await handler(req, res);
        expect(res.statusCode).toBe(405);
    });

    it('requires a password', async () => {
        const { req, res } = createMockReqRes('POST', {});
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Password is required');
    });

    it('returns a session token on valid login via Secure Cookie', async () => {
        const { req, res } = createMockReqRes('POST', { password: 'test-secret-password' });
        await handler(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeUndefined(); // Token should NO LONGER be in the body

        // Check Set-Cookie was called
        expect(res.setHeader).toHaveBeenCalledWith(
            'Set-Cookie',
            expect.stringContaining('sessionToken=')
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            'Set-Cookie',
            expect.stringContaining('HttpOnly')
        );
    });

    it('returns 401 with generic error for invalid password', async () => {
        const { req, res } = createMockReqRes('POST', { password: 'wrong-password' });
        await handler(req, res);
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBe('Invalid password');
        // Should NOT reveal what the correct password is
        expect(JSON.stringify(res.body)).not.toContain('test-secret-password');
    });

    it('returns 429 when account is locked', async () => {
        const futureDate = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        sql.mockResolvedValueOnce({
            rows: [{ ip_address: '127.0.0.1', attempts: 5, locked_until: futureDate }],
        });

        const { req, res } = createMockReqRes('POST', { password: 'any' });
        await handler(req, res);
        expect(res.statusCode).toBe(429);
        expect(res.body.error).toContain('Too many attempts');
    });
});
