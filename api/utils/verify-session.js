import { sql } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * Create a new session token for a user and store it in the database.
 * Returns the token string.
 */
export async function createSession(identifier = 'admin') {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create sessions table if it doesn't exist
    await sql`
        CREATE TABLE IF NOT EXISTS sessions (
            token VARCHAR(64) PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Clean up expired sessions
    await sql`DELETE FROM sessions WHERE expires_at < NOW()`;

    // Insert new session
    await sql`
        INSERT INTO sessions (token, identifier, expires_at)
        VALUES (${token}, ${identifier}, ${expiresAt.toISOString()})
    `;

    return token;
}

/**
 * Verify a session token. Returns true if valid, false if expired/missing.
 */
export async function verifySession(token) {
    if (!token || typeof token !== 'string' || token.length < 32) {
        return false;
    }

    try {
        const { rows } = await sql`
            SELECT * FROM sessions
            WHERE token = ${token} AND expires_at > NOW()
        `;
        return rows.length > 0;
    } catch {
        return false;
    }
}

/**
 * Verify the admin password using timing-safe comparison.
 * Compares against the ADMIN_PASSWORD env var (NOT VITE_ prefixed).
 */
export function verifyPassword(password) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || !password) return false;

    // Timing-safe comparison to prevent timing attacks
    const a = Buffer.from(password);
    const b = Buffer.from(expected);

    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

/**
 * Middleware-style function to verify session from request headers.
 * Returns { authenticated: true } or { authenticated: false, response: {...} }
 */
export async function requireAuth(req) {
    const token = req.headers['x-admin-auth'];

    if (!token) {
        return {
            authenticated: false,
            status: 401,
            body: { error: 'Unauthorized' },
        };
    }

    const valid = await verifySession(token);
    if (!valid) {
        return {
            authenticated: false,
            status: 401,
            body: { error: 'Session expired or invalid' },
        };
    }

    return { authenticated: true };
}
