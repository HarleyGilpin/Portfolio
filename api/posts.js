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
            const { title, content, excerpt, image, slug } = req.body;
            if (!title || !slug) throw new Error('Title and Slug are required');

            const { rows } = await sql`
        INSERT INTO posts (title, slug, excerpt, content, image)
        VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${image})
        RETURNING *;
      `;
            return res.status(201).json(rows[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
