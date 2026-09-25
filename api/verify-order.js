
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
    }

    if (typeof session_id !== 'string' || !/^cs_[A-Za-z0-9_]{1,250}$/.test(session_id)) {
        return res.status(400).json({ error: 'Invalid session_id' });
    }

    // Rate limit: 20 verifications per minute per IP
    const { rateLimit } = await import('./_utils/rate-limit.js');
    const rl = await rateLimit(req, { maxRequests: 20, windowMs: 60_000, keyPrefix: 'verify-order' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    try {
        // 1. Retrieve the session from Stripe to verify payment status
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Check payment status - subscriptions show 'paid' after first invoice,
        // but initially show 'unpaid' until invoice processes
        // For subscriptions, also check if subscription was created successfully
        const isPaid = session.payment_status === 'paid';
        const isSubscriptionComplete = session.mode === 'subscription' && session.subscription;

        if (!isPaid && !isSubscriptionComplete) {
            return res.status(400).json({ error: 'Payment not successful', details: { payment_status: session.payment_status, mode: session.mode } });
        }

        const orderId = session.metadata.orderId;

        // 2. Mark a pending order as paid. The service agreement was sealed at
        // checkout and is never rewritten here, so revisiting this URL cannot
        // alter the agreement or revert a later status (e.g. hosting_canceled).
        const { rows } = await sql`
      UPDATE orders 
      SET status = 'paid'
      WHERE id = ${orderId} AND stripe_session_id = ${session_id} AND status = 'pending'
      RETURNING id, tier_name, price, client_name, agreement_content, hosting_tier, hosting_price;
    `;

        if (rows.length === 0) {
            // Already processed (e.g. by the webhook) — return the existing order
            const { rows: existingRows } = await sql`
                SELECT id, tier_name, price, client_name, agreement_content, hosting_tier, hosting_price
                FROM orders WHERE stripe_session_id = ${session_id}
            `;
            if (existingRows.length > 0) {
                return res.status(200).json({ order: existingRows[0] });
            }
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json({ order: rows[0] });

    } catch (error) {
        console.error('Verify API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
