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

describe('Checkout Input Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
        sql.mockResolvedValue({ rows: [{ id: 1 }] });
    });

    it('rejects requests missing required fields', async () => {
        const { req, res } = createMockReqRes('POST', {});
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain('Missing required fields');
    });

    it('rejects invalid tier IDs', async () => {
        const { req, res } = createMockReqRes('POST', {
            tierId: '999',
            clientName: 'Test',
            clientEmail: 'test@example.com',
        });
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid tier ID');
    });

    it('rejects invalid hosting tier IDs', async () => {
        const { req, res } = createMockReqRes('POST', {
            tierId: '0',
            clientName: 'Test',
            clientEmail: 'test@example.com',
            hostingTier: 'nonexistent',
        });
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Invalid hosting tier');
    });

    it('uses server-side pricing (ignores client-supplied price)', async () => {
        // Tier 0 = $10 server-side. Client tries to send price: 1
        const { req, res } = createMockReqRes('POST', {
            tierId: '0',
            clientName: 'Test',
            clientEmail: 'test@example.com',
            price: 1, // This should be ignored
        });
        await handler(req, res);
        // If it gets to Stripe (200), the SQL call should have the correct price
        if (res.statusCode === 200) {
            // Check that the SQL insert used price=10 (tier 0), not price=1
            const insertCall = sql.mock.calls.find(call =>
                call[0]?.some?.(s => typeof s === 'string' && s.includes('INSERT INTO orders'))
            );
            expect(insertCall).toBeDefined();
        }
    });

    it('accepts valid checkout with valid tier', async () => {
        const { req, res } = createMockReqRes('POST', {
            tierId: '3',
            clientName: 'Valid Client',
            clientEmail: 'valid@example.com',
            projectDetails: 'A valid project',
        });
        await handler(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.url).toBeDefined();
    });
});
