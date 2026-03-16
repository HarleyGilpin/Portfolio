/**
 * In-memory rate limiter for Vercel Serverless Functions.
 *
 * Note: Each Vercel function invocation may run in a different isolate,
 * so this provides "best-effort" rate limiting within a single instance.
 * For stronger guarantees, use a Redis-backed solution (e.g., Upstash).
 * However, this is still effective because Vercel often reuses warm
 * instances for sequential requests.
 */

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
 * Check rate limit for a given key.
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
 * Express/Vercel middleware-style rate limiter.
 * Returns null if allowed, or a pre-built response object if blocked.
 *
 * @param {import('http').IncomingMessage} req
 * @param {object} options
 * @param {number} options.maxRequests
 * @param {number} options.windowMs
 * @param {string} [options.keyPrefix] - Optional prefix for rate limit key
 */
export function rateLimit(req, { maxRequests = 20, windowMs = 60_000, keyPrefix = '' } = {}) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress
        || 'unknown';

    const key = `${keyPrefix}:${ip}`;
    const result = checkRateLimit(key, { maxRequests, windowMs });

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
