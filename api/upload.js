import { handleUpload } from '@vercel/blob/client';
import { requireAuth } from './utils/verify-session.js';

export default async function handler(req, res) {
    const body = req.body;

    // Security Check — via header (no longer via query param)
    const auth = await requireAuth(req);
    if (!auth.authenticated) {
        return res.status(auth.status).json(auth.body);
    }

    try {
        const jsonResponse = await handleUpload({
            body,
            request: req,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    tokenPayload: JSON.stringify({}),
                    addRandomSuffix: true,
                };
            },
        });

        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(400).json({ error: 'Upload failed' });
    }
}
