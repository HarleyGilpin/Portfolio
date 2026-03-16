import { sql } from '@vercel/postgres';
import { requireAuth } from './utils/verify-session.js';
import { rateLimit } from './utils/rate-limit.js';
import { validateOrigin } from './utils/csrf.js';

export default async function handler(req, res) {
    // CSRF protection for state-changing methods
    const csrf = validateOrigin(req);
    if (!csrf.valid) {
        return res.status(csrf.status).json(csrf.body);
    }

    // Rate limit: 30 reads or 10 writes per minute per IP
    const limit = req.method === 'GET' ? 30 : 10;
    const rl = rateLimit(req, { maxRequests: limit, windowMs: 60_000, keyPrefix: 'posts' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    if (req.method === 'GET') {
        try {
            const { rows } = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
            return res.status(200).json(rows);
        } catch (error) {
            console.error('Posts fetch error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const auth = await requireAuth(req);
            if (!auth.authenticated) {
                return res.status(auth.status).json(auth.body);
            }

            const { title, content, excerpt, image, slug, category, keywords } = req.body;
            if (!title || !slug) {
                return res.status(400).json({ error: 'Title and Slug are required' });
            }

            const { rows } = await sql`
        INSERT INTO posts (title, slug, excerpt, content, image, category, keywords)
        VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${image}, ${category}, ${keywords})
        RETURNING *;
      `;
            return res.status(201).json(rows[0]);
        } catch (error) {
            console.error('Post creation error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
