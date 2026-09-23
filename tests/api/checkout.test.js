import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

// Mock stripe
vi.mock('stripe', () => {
    const StripeMock = function () {
        this.checkout = {
            sessions: {
                create: vi.fn().mockResolvedValue({
                    id: 'cs_test_123',
                    url: 'https://checkout.stripe.com/test',
                }),
            },
        };
    };
    return { default: StripeMock };
});

import { sql } from '@vercel/postgres';
import handler from '../../api/create-checkout-session.js';

function createMockReqRes(method = 'POST', body = {}, headers = {}) {
    return {
        req: {
            method,
            body,
            headers: { origin: 'http://localhost:3000', ...headers },
        },
        res: {
            statusCode: null,
            body: null,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; },
        },
    };
}

describe('POST /api/create-checkout-session', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
        sql.mockResolvedValue({ rows: [{ id: 1 }] });
    });

    it('rejects non-POST methods', async () => {
        const { req, res } = createMockReqRes('GET');
        await handler(req, res);
        expect(res.statusCode).toBe(405);
    });

    it('error response does NOT leak internal details', async () => {
        // Force an error after validation passes
        sql.mockRejectedValue(new Error('relation "orders" does not exist'));

        const { req, res } = createMockReqRes('POST', {
            tierId: '0',
            tierName: 'Test',
            price: 100,
            clientName: 'Test User',
            clientEmail: 'test@example.com',
        });
        await handler(req, res);
        expect(res.statusCode).toBe(500);
        // Must NOT contain the SQL error message
        expect(JSON.stringify(res.body)).not.toContain('relation');
        expect(JSON.stringify(res.body)).not.toContain('does not exist');
        expect(res.body.error).toBe('Internal Server Error');
        expect(res.body.details).toBeUndefined();
    });
});
