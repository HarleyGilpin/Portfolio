/**
 * Rate limiter for Vercel Serverless Functions.
 *
 * Counters live in Postgres so limits hold across function instances.
 * If the database is unreachable, falls back to a per-instance in-memory
 * counter so a DB outage degrades to best-effort limiting instead of none.
 */

import { sql } from '@vercel/postgres';

// Probability that a request also purges expired counters
const CLEANUP_PROBABILITY = 0.01;

let tableReady = null;

function ensureTable() {
    tableReady ??= sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
            key TEXT PRIMARY KEY,
            count INTEGER NOT NULL,
            reset_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
    `.catch((error) => {
        tableReady = null; // Retry on the next request
        throw error;
    });
    return tableReady;
}

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a given key using the per-instance in-memory store.
 *
 * @param {string} key - Unique identifier (e.g., IP address or IP + route)
 * @param {object} options
 * @param {number} options.maxRequests - Maximum requests allowed in the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(key, { maxRequests = 10, windowMs = 60_000 } = {}) {
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        entry = { count: 0, resetTime: now + windowMs };
        rateLimitStore.set(key, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: entry.resetTime - now,
        };
    }

    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        retryAfterMs: 0,
    };
}

/**
 * Check rate limit for a given key using a shared Postgres counter.
 * The window resets atomically in a single upsert, so concurrent requests
 * from different instances are counted correctly.
 *
 * @param {string} key
 * @param {object} options
 * @param {number} options.maxRequests
 * @param {number} options.windowMs
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfterMs: number }>}
 */
export async function checkRateLimitDb(key, { maxRequests = 10, windowMs = 60_000 } = {}) {
    await ensureTable();

    const resetAt = new Date(Date.now() + windowMs).toISOString();
    const { rows } = await sql`
        INSERT INTO rate_limits (key, count, reset_at)
        VALUES (${key}, 1, ${resetAt})
        ON CONFLICT (key)
        DO UPDATE SET
            count = CASE WHEN rate_limits.reset_at <= NOW() THEN 1 ELSE rate_limits.count + 1 END,
            reset_at = CASE WHEN rate_limits.reset_at <= NOW() THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
        RETURNING count, reset_at
    `;

    if (Math.random() < CLEANUP_PROBABILITY) {
        sql`DELETE FROM rate_limits WHERE reset_at < NOW()`.catch(() => {});
    }

    const count = rows[0]?.count ?? 1;
    if (count > maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: Math.max(0, new Date(rows[0].reset_at) - Date.now()),
        };
    }

    return { allowed: true, remaining: maxRequests - count, retryAfterMs: 0 };
}

/**
 * Resolve the client IP. Vercel overwrites x-forwarded-for with the real
 * client address, so the first entry is trustworthy there.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || 'unknown';
}

/**
 * Express/Vercel middleware-style rate limiter.
 * Resolves to { limited: false } if allowed, or a pre-built response object if blocked.
 *
 * @param {import('http').IncomingMessage} req
 * @param {object} options
 * @param {number} options.maxRequests
 * @param {number} options.windowMs
 * @param {string} [options.keyPrefix] - Optional prefix for rate limit key
 */
export async function rateLimit(req, { maxRequests = 20, windowMs = 60_000, keyPrefix = '' } = {}) {
    const key = `${keyPrefix}:${getClientIp(req)}`;

    let result;
    try {
        result = await checkRateLimitDb(key, { maxRequests, windowMs });
    } catch {
        console.error('Rate limit DB unavailable, using in-memory fallback');
        result = checkRateLimit(key, { maxRequests, windowMs });
    }

    if (!result.allowed) {
        return {
            limited: true,
            status: 429,
            body: { error: 'Too many requests. Please try again later.' },
            retryAfterMs: result.retryAfterMs,
        };
    }

    return { limited: false, remaining: result.remaining };
}
