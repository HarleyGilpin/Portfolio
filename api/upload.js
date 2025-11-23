import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
    const body = req.body;

    // Security Check
    const authHeader = req.query.auth;
    const expectedAuth = process.env.VITE_ADMIN_PASSWORD;

    console.log('Upload request received.');
    console.log('Auth Header:', authHeader ? `Present (Length: ${authHeader.length})` : 'Missing');
    console.log('Expected Auth:', expectedAuth ? `Present (Length: ${expectedAuth.length})` : 'Missing');

    if (authHeader !== expectedAuth) {
        console.error('Unauthorized upload attempt. Tokens do not match.');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('Starting handleUpload...');
        const jsonResponse = await handleUpload({
            body,
            request: req,
            onBeforeGenerateToken: async (pathname) => {
                console.log('Generating token for:', pathname);
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    tokenPayload: JSON.stringify({}),
                    addRandomSuffix: true,
                };
            },
        });
        console.log('Upload successful:', jsonResponse);

        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Server-side upload error:', error);
        return res.status(400).json({ error: error.message });
    }
}
