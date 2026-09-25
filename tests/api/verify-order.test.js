import { describe, it, expect, vi, beforeEach } from 'vitest';

// Rate limiting has its own tests; stub it so it doesn't consume SQL mocks
vi.mock('../../api/_utils/rate-limit.js', async (importOriginal) => ({
    ...(await importOriginal()),
    rateLimit: vi.fn().mockResolvedValue({ limited: false }),
}));

vi.mock('@vercel/postgres', () => ({
    sql: vi.fn(),
}));

const { retrieve } = vi.hoisted(() => ({ retrieve: vi.fn() }));
vi.mock('stripe', () => {
    const StripeMock = function () {
        this.checkout = { sessions: { retrieve } };
    };
    return { default: StripeMock };
});

import { sql } from '@vercel/postgres';
import handler from '../../api/verify-order.js';

function createMockReqRes(query = {}) {
    return {
        req: { method: 'GET', query, headers: {} },
        res: {
            statusCode: null,
            body: null,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; },
        },
    };
}

describe('GET /api/verify-order', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        retrieve.mockResolvedValue({ payment_status: 'paid', mode: 'payment', metadata: { orderId: '1' } });
        sql.mockResolvedValue({ rows: [{ id: 1 }] });
    });

    it.each([
        ['array', ['cs_test_a', 'cs_test_b']],
        ['non-Stripe id', 'not_a_session'],
    ])('rejects a malformed session_id (%s)', async (_label, session_id) => {
        const { req, res } = createMockReqRes({ session_id });
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        expect(retrieve).not.toHaveBeenCalled();
    });

    it('only transitions pending orders and never rewrites the agreement', async () => {
        const { req, res } = createMockReqRes({ session_id: 'cs_test_abc123' });
        await handler(req, res);
        expect(res.statusCode).toBe(200);

        const updateQuery = sql.mock.calls[0][0].join('');
        expect(updateQuery).toContain("status = 'pending'");
        expect(updateQuery).not.toContain('agreement_content =');
    });
});
