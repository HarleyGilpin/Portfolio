
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limit: 30 fetches per minute per IP
    const { rateLimit } = await import('./_utils/rate-limit.js');
    const rl = await rateLimit(req, { maxRequests: 30, windowMs: 60_000, keyPrefix: 'blocked-dates' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    try {
        // Fetch deadlines from paid orders only. Unpaid 'pending' orders are
        // excluded so anyone can't block the calendar by abandoning checkouts.
        const { rows } = await sql`
            SELECT deadline
            FROM orders
            WHERE status IN ('paid', 'onboarding_started')
            AND deadline IS NOT NULL
            AND deadline != ''
        `;

        // Extract dates and filter out invalid ones
        const blockedDates = rows
            .map(row => row.deadline)
            .filter(date => !isNaN(new Date(date).getTime()));

        return res.status(200).json({ blockedDates });

    } catch (error) {
        console.error('Error fetching blocked dates:', error);
        return res.status(500).json({ error: 'Failed to fetch usage data' });
    }
}
