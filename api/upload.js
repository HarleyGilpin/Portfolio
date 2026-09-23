import { handleUpload } from '@vercel/blob/client';
import { requireAuth } from './_utils/verify-session.js';
import { rateLimit } from './_utils/rate-limit.js';
import { validateOrigin } from './_utils/csrf.js';

export default async function handler(req, res) {
    // CSRF protection
    const csrf = validateOrigin(req);
    if (!csrf.valid) {
        return res.status(csrf.status).json(csrf.body);
    }

    // Rate limit: 10 uploads per minute per IP
    const rl = rateLimit(req, { maxRequests: 10, windowMs: 60_000, keyPrefix: 'upload' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

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
                    maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB limit
                    tokenPayload: JSON.stringify({}),
                    addRandomSuffix: true,
                };
            },
        });

        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Upload error:', { timestamp: new Date().toISOString() });
        return res.status(400).json({ error: 'Upload failed' });
    }
}
