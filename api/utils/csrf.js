/**
 * CSRF protection via Origin/Referer header validation.
 *
 * For SPA + API architectures, origin validation is the recommended
 * CSRF defense (OWASP). It verifies that state-changing requests
 * originate from the expected domain, preventing cross-origin form
 * submissions and fetch requests from malicious sites.
 *
 * This works because:
 * - Browsers send Origin/Referer headers automatically
 * - These headers cannot be spoofed by JavaScript in a browser
 * - Cross-origin requests from malicious sites will have a different origin
 */

const ALLOWED_ORIGINS = [
    process.env.SITE_URL || 'https://harleygilpin.com',
    'https://www.harleygilpin.com',
];

/**
 * Validate that a request originates from an allowed origin.
 * Should be applied to all state-changing (POST/PUT/DELETE) endpoints.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {{ valid: boolean, status?: number, body?: object }}
 */
export function validateOrigin(req) {
    // Only check state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return { valid: true };
    }

    const origin = req.headers['origin'];
    const referer = req.headers['referer'];

    // Get the origin from either header
    let requestOrigin = origin;
    if (!requestOrigin && referer) {
        try {
            requestOrigin = new URL(referer).origin;
        } catch {
            // Invalid referer URL
        }
    }

    // Allow requests with no origin header (e.g., same-origin navigation,
    // server-to-server like Stripe webhooks, curl, etc.)
    if (!requestOrigin) {
        return { valid: true };
    }

    // Allow localhost on any port (development)
    try {
        const url = new URL(requestOrigin);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            return { valid: true };
        }
    } catch {
        // Invalid origin URL
    }

    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
        return { valid: true };
    }

    return {
        valid: false,
        status: 403,
        body: { error: 'Forbidden' },
    };
}
