import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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
 * Delete a session token from the database (server-side logout).
 * Returns true if a session was deleted, false otherwise.
 */
export async function deleteSession(token) {
    if (!token || typeof token !== 'string' || token.length < 32) {
        return false;
    }

    try {
        const { rowCount } = await sql`
            DELETE FROM sessions WHERE token = ${token}
        `;
        return rowCount > 0;
    } catch {
        return false;
    }
}

/**
 * Verify the admin password using bcrypt.
 * Compares against the ADMIN_PASSWORD_HASH env var (bcrypt hash).
 */
export async function verifyPassword(password) {
    if (!password) return false;

    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) {
        console.error('ADMIN_PASSWORD_HASH is not set; admin login is disabled');
        return false;
    }

    return bcrypt.compare(password, hash);
}

/**
 * Middleware-style function to verify session from request headers.
 * Returns { authenticated: true } or { authenticated: false, response: {...} }
 */
export async function requireAuth(req) {
    const cookies = req.headers.cookie;
    let token = null;

    if (cookies) {
        const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('sessionToken='));
        if (tokenCookie) {
            token = tokenCookie.split('=')[1];
        }
    }

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
