import { sql } from '@vercel/postgres';
import { createSession, verifyPassword } from './_utils/verify-session.js';
import { rateLimit, getClientIp } from './_utils/rate-limit.js';
import { validateOrigin } from './_utils/csrf.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

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
        const rl = await rateLimit(req, { maxRequests: 5, windowMs: 60_000, keyPrefix: 'login' });
        if (rl.limited) {
            return res.status(429).json(rl.body);
        }
    }

    const { password } = req.body || {};
    const ip = getClientIp(req);

    if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        // Count this attempt atomically *before* verifying, so parallel requests
        // cannot all read a stale count and slip past the lockout (skip in dev).
        if (!isDev) {
            const { rows } = await sql`
                INSERT INTO login_attempts (ip_address, attempts, last_attempt)
                VALUES (${ip}, 1, NOW())
                ON CONFLICT (ip_address)
                DO UPDATE SET
                    attempts = CASE WHEN login_attempts.locked_until <= NOW() THEN 1 ELSE login_attempts.attempts + 1 END,
                    locked_until = CASE WHEN login_attempts.locked_until <= NOW() THEN NULL ELSE login_attempts.locked_until END,
                    last_attempt = NOW()
                RETURNING attempts, locked_until
            `;

            const attemptRecord = rows[0];
            let lockedUntil = attemptRecord?.locked_until ? new Date(attemptRecord.locked_until) : null;

            // Lock after MAX_ATTEMPTS failures; the next attempt triggers the lock
            if (!lockedUntil && attemptRecord?.attempts > MAX_ATTEMPTS) {
                lockedUntil = new Date(Date.now() + LOCKOUT_MS);
                await sql`
                    UPDATE login_attempts SET locked_until = ${lockedUntil.toISOString()}
                    WHERE ip_address = ${ip}
                `;
            }

            if (lockedUntil && new Date() < lockedUntil) {
                const waitTime = Math.ceil((lockedUntil - new Date()) / 60000);
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

            // Set secure HttpOnly cookie
            res.setHeader('Set-Cookie', `sessionToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);

            return res.status(200).json({ success: true });
        } else {
            // Failed attempt was already counted above
            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
