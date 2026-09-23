
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limit: 30 fetches per minute per IP
    const { rateLimit } = await import('./_utils/rate-limit.js');
    const rl = rateLimit(req, { maxRequests: 30, windowMs: 60_000, keyPrefix: 'blocked-dates' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    try {
        // Fetch all deadlines from active orders
        // Exclude Cancelled or Rejected orders
        const { rows } = await sql`
            SELECT deadline 
            FROM orders 
            WHERE status NOT IN ('canceled', 'rejected', 'hosting_canceled')
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
