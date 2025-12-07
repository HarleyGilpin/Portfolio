import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { rows } = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const authHeader = req.headers['x-admin-auth'];
            if (authHeader !== process.env.VITE_ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Ensure columns exist (Migration for dev)
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(255)`;
            await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS keywords TEXT`;

            const { title, content, excerpt, image, slug, category, keywords } = req.body;
            if (!title || !slug) throw new Error('Title and Slug are required');

            const { rows } = await sql`
        INSERT INTO posts (title, slug, excerpt, content, image, category, keywords)
        VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${image}, ${category}, ${keywords})
        RETURNING *;
      `;
            return res.status(201).json(rows[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
