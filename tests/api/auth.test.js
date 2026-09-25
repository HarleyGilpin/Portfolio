import { describe, it, expect, vi, beforeEach } from 'vitest';

// Rate limiting has its own tests; stub it so it doesn't consume SQL mocks
vi.mock('../../api/_utils/rate-limit.js', async (importOriginal) => ({
    ...(await importOriginal()),
    rateLimit: vi.fn().mockResolvedValue({ limited: false }),
}));

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
import bcrypt from 'bcryptjs';
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

// Low cost factor keeps the test fast
const TEST_PASSWORD_HASH = bcrypt.hashSync('test-secret-password', 4);

describe('POST /api/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.ADMIN_PASSWORD_HASH = TEST_PASSWORD_HASH;

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

    it('counts the attempt atomically before verifying the password', async () => {
        const { req, res } = createMockReqRes('POST', { password: 'wrong-password' });
        await handler(req, res);
        const firstQuery = sql.mock.calls[0][0].join('');
        expect(firstQuery).toContain('INSERT INTO login_attempts');
        expect(firstQuery).toContain('login_attempts.attempts + 1');
    });

    it('locks out once the attempt count exceeds the limit', async () => {
        sql.mockResolvedValueOnce({ rows: [{ attempts: 6, locked_until: null }] });

        const { req, res } = createMockReqRes('POST', { password: 'test-secret-password' });
        await handler(req, res);
        expect(res.statusCode).toBe(429);
        const lockQuery = sql.mock.calls[1][0].join('');
        expect(lockQuery).toContain('UPDATE login_attempts SET locked_until');
    });

    it('keys attempts on the first x-forwarded-for entry', async () => {
        const { req, res } = createMockReqRes('POST', { password: 'wrong-password' }, {
            'x-forwarded-for': '203.0.113.7, 10.0.0.1',
        });
        await handler(req, res);
        expect(sql.mock.calls[0]).toContain('203.0.113.7');
    });

    it('rejects login when ADMIN_PASSWORD_HASH is unset, even with a plaintext ADMIN_PASSWORD', async () => {
        delete process.env.ADMIN_PASSWORD_HASH;
        process.env.ADMIN_PASSWORD = 'test-secret-password';

        const { req, res } = createMockReqRes('POST', { password: 'test-secret-password' });
        await handler(req, res);
        expect(res.statusCode).toBe(401);
        expect(res.setHeader).not.toHaveBeenCalled();

        delete process.env.ADMIN_PASSWORD;
    });
});
