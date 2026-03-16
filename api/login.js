import { sql } from '@vercel/postgres';
import { createSession, verifyPassword } from './utils/verify-session.js';
import { rateLimit } from './utils/rate-limit.js';
import { validateOrigin } from './utils/csrf.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const isDev = process.env.NODE_ENV === 'development';

    // Skip rate limiting in dev
    if (!isDev) {
        // CSRF protection
        const csrf = validateOrigin(req);
        if (!csrf.valid) {
            return res.status(csrf.status).json(csrf.body);
        }

        // Rate limit: 5 login attempts per minute per IP
        const rl = rateLimit(req, { maxRequests: 5, windowMs: 60_000, keyPrefix: 'login' });
        if (rl.limited) {
            return res.status(429).json(rl.body);
        }
    }

    const { password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        let attemptRecord = null;

        // Check for existing lock (skip in dev)
        if (!isDev) {
            const { rows } = await sql`
                SELECT * FROM login_attempts WHERE ip_address = ${ip}
            `;

            attemptRecord = rows[0];

            if (attemptRecord && attemptRecord.locked_until && new Date() < new Date(attemptRecord.locked_until)) {
                const waitTime = Math.ceil((new Date(attemptRecord.locked_until) - new Date()) / 60000);
                return res.status(429).json({ error: `Too many attempts. Please try again in ${waitTime} minutes.` });
            }
        }

        if (await verifyPassword(password)) {
            // Reset attempts on success
            await sql`
                INSERT INTO login_attempts (ip_address, attempts, locked_until)
                VALUES (${ip}, 0, NULL)
                ON CONFLICT (ip_address)
                DO UPDATE SET attempts = 0, locked_until = NULL
            `;

            // Create a session token (not the password!)
            const token = await createSession('admin');

            return res.status(200).json({ success: true, token });
        } else {
            if (!isDev) {
                // Increment attempts on failure
                const newAttempts = (attemptRecord?.attempts || 0) + 1;
                let lockedUntil = null;

                if (newAttempts >= 5) {
                    lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
                }

                await sql`
                    INSERT INTO login_attempts (ip_address, attempts, locked_until)
                    VALUES (${ip}, ${newAttempts}, ${lockedUntil ? lockedUntil.toISOString() : null})
                    ON CONFLICT (ip_address)
                    DO UPDATE SET attempts = ${newAttempts}, locked_until = ${lockedUntil ? lockedUntil.toISOString() : null}, last_attempt = NOW()
                `;
            }

            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
