import { sql } from '@vercel/postgres';
import { requireAuth } from './_utils/verify-session.js';
import { rateLimit } from './_utils/rate-limit.js';
import { validateOrigin } from './_utils/csrf.js';

export default async function handler(req, res) {
    const { id, slug } = req.query;

    // CSRF protection for state-changing methods
    const csrf = validateOrigin(req);
    if (!csrf.valid) {
        return res.status(csrf.status).json(csrf.body);
    }

    // Rate limit: 30 reads or 10 writes per minute per IP
    const limit = req.method === 'GET' ? 30 : 10;
    const rl = rateLimit(req, { maxRequests: limit, windowMs: 60_000, keyPrefix: 'post' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    if (req.method === 'GET') {
        try {
            if (id) {
                const { rows } = await sql`SELECT * FROM posts WHERE id = ${id}`;
                if (rows.length === 0) return res.status(404).json({ error: 'Post not found' });
                return res.status(200).json(rows[0]);
            }
            if (slug) {
                const { rows } = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
                if (rows.length === 0) return res.status(404).json({ error: 'Post not found' });
                return res.status(200).json(rows[0]);
            }
            return res.status(400).json({ error: 'ID or Slug required' });
        } catch (error) {
            console.error('Post fetch error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const auth = await requireAuth(req);
            if (!auth.authenticated) {
                return res.status(auth.status).json(auth.body);
            }

            const { title, content, excerpt, image, category, keywords } = req.body;
            if (!id) return res.status(400).json({ error: 'ID required' });

            const { rows } = await sql`
        UPDATE posts 
        SET title = ${title}, content = ${content}, excerpt = ${excerpt}, image = ${image}, category = ${category}, keywords = ${keywords}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
            return res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Post update error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const auth = await requireAuth(req);
            if (!auth.authenticated) {
                return res.status(auth.status).json(auth.body);
            }

            if (!id) return res.status(400).json({ error: 'ID required' });
            await sql`DELETE FROM posts WHERE id = ${id}`;
            return res.status(200).json({ message: 'Post deleted' });
        } catch (error) {
            console.error('Post delete error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
