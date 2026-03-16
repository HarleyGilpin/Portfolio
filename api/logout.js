import { deleteSession } from './utils/verify-session.js';
import { validateOrigin } from './utils/csrf.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CSRF protection
    const csrf = validateOrigin(req);
    if (!csrf.valid) {
        return res.status(csrf.status).json(csrf.body);
    }

    // Get token from cookies instead of custom header
    const cookies = req.headers.cookie;
    let token = null;

    if (cookies) {
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('sessionToken='));
        if (tokenCookie) {
            token = tokenCookie.split('=')[1];
        }
    }

    if (!token) {
        return res.status(400).json({ error: 'No token provided' });
    }

    await deleteSession(token);

    // Always return success and clear the cookie to avoid revealing token state
    res.setHeader('Set-Cookie', 'sessionToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
    return res.status(200).json({ success: true });
}
