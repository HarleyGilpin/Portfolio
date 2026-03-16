import { requireAuth } from './_utils/verify-session.js';
import { rateLimit } from './_utils/rate-limit.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Light rate limiting for session checks
    const rl = rateLimit(req, { maxRequests: 60, windowMs: 60_000, keyPrefix: 'me' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    const auth = await requireAuth(req);
    
    if (auth.authenticated) {
        return res.status(200).json({ authenticated: true });
    } else {
        return res.status(200).json({ authenticated: false });
    }
}
