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

    const token = req.headers['x-admin-auth'];

    if (!token) {
        return res.status(400).json({ error: 'No token provided' });
    }

    const deleted = await deleteSession(token);

    // Always return success to avoid revealing whether the token existed
    return res.status(200).json({ success: true });
}
