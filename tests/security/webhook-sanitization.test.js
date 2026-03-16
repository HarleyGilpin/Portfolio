import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist the mock function so it's available when vi.mock factory runs
const { mockConstructEvent } = vi.hoisted(() => ({
    mockConstructEvent: vi.fn(),
}));

// Mock stripe
vi.mock('stripe', () => {
    const StripeMock = function () {
        this.webhooks = {
            constructEvent: mockConstructEvent,
        };
        this.customers = { retrieve: vi.fn() };
    };
    return { default: StripeMock };
});

// Mock @vercel/postgres
vi.mock('@vercel/postgres', () => ({
    sql: vi.fn().mockResolvedValue({ rows: [{ id: 1 }] }),
}));

import handler from '../../api/stripe-webhook.js';

function createMockReqRes() {
    const req = {
        method: 'POST',
        headers: { 'stripe-signature': 'sig_test' },
        on: vi.fn(function (event, cb) {
            if (event === 'data') cb(Buffer.from('{}'));
            if (event === 'end') cb();
            return req;
        }),
    };

    const res = {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; },
    };

    return { req, res };
}

describe('Webhook error sanitization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    });

    it('does NOT leak signature error details in response', async () => {
        mockConstructEvent.mockImplementation(() => {
            throw new Error('No signatures found matching the expected signature for payload');
        });

        const { req, res } = createMockReqRes();
        await handler(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Webhook signature verification failed');
        expect(JSON.stringify(res.body)).not.toContain('No signatures found');
        expect(JSON.stringify(res.body)).not.toContain('expected signature');
    });

    it('returns 200 for valid webhook events', async () => {
        mockConstructEvent.mockReturnValue({
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_123',
                    metadata: { orderId: '1' },
                },
            },
        });

        const { req, res } = createMockReqRes();
        await handler(req, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.received).toBe(true);
    });
});
