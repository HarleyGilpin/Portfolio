import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockConstructEvent } = vi.hoisted(() => ({
    mockConstructEvent: vi.fn(),
}));

vi.mock('stripe', () => {
    const StripeMock = function () {
        this.webhooks = { constructEvent: mockConstructEvent };
        this.customers = { retrieve: vi.fn() };
    };
    return { default: StripeMock };
});

vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

import { sql } from '@vercel/postgres';
import handler from '../../api/stripe-webhook.js';
import { escapeMarkdown } from '../../api/_utils/markdown.js';

const query = (call) => call[0].join('');

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

const checkoutEvent = {
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: { object: { metadata: { orderId: '7' } } },
};

describe('Stripe webhook idempotency', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockConstructEvent.mockReturnValue(checkoutEvent);
    });

    it('skips events that were already processed', async () => {
        // ON CONFLICT DO NOTHING returns no row for an already-recorded event
        sql.mockResolvedValue({ rows: [] });

        const { req, res } = createMockReqRes();
        await handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.duplicate).toBe(true);
        expect(sql.mock.calls.some(call => query(call).includes('UPDATE orders'))).toBe(false);
    });

    it('processes new events', async () => {
        sql.mockImplementation(async (strings) =>
            strings.join('').includes('INSERT INTO stripe_events') ? { rows: [{ id: 'evt_test_1' }] } : { rows: [] }
        );

        const { req, res } = createMockReqRes();
        await handler(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body.duplicate).toBeUndefined();
        expect(sql.mock.calls.some(call => query(call).includes('UPDATE orders'))).toBe(true);
    });

    it('returns 500 so Stripe retries when the event cannot be recorded', async () => {
        sql.mockRejectedValue(new Error('db down'));

        const { req, res } = createMockReqRes();
        await handler(req, res);

        expect(res.statusCode).toBe(500);
        expect(JSON.stringify(res.body)).not.toContain('db down');
    });
});

describe('escapeMarkdown', () => {
    it('neutralizes links, images, and formatting', () => {
        const escaped = escapeMarkdown('[click](https://evil.example) ![x](y) **bold** <b>');
        expect(escaped).not.toMatch(/(^|[^\\])\[/);
        expect(escaped).toBe('\\[click\\]\\(https://evil\\.example\\) \\!\\[x\\]\\(y\\) \\*\\*bold\\*\\* \\<b\\>');
    });

    it('handles null and non-strings', () => {
        expect(escapeMarkdown(null)).toBe('');
        expect(escapeMarkdown(42)).toBe('42');
    });
});
