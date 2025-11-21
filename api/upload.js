import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
    const body = req.body;

    // Security Check
    const authHeader = req.query.auth;
    if (authHeader !== process.env.VITE_ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const jsonResponse = await handleUpload({
            body,
            request: req,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    tokenPayload: JSON.stringify({}),
                };
            },
        });

        return res.status(200).json(jsonResponse);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
