import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    const { id, slug } = req.query;

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
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PUT') {
        try {
            const authHeader = req.headers['x-admin-auth'];
            if (authHeader !== process.env.VITE_ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Unauthorized' });
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
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const authHeader = req.headers['x-admin-auth'];
            if (authHeader !== process.env.VITE_ADMIN_PASSWORD) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!id) return res.status(400).json({ error: 'ID required' });
            await sql`DELETE FROM posts WHERE id = ${id}`;
            return res.status(200).json({ message: 'Post deleted' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
