import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        // Check for existing lock
        const { rows } = await sql`
            SELECT * FROM login_attempts WHERE ip_address = ${ip}
        `;

        const attemptRecord = rows[0];

        if (attemptRecord && attemptRecord.locked_until && new Date() < new Date(attemptRecord.locked_until)) {
            const waitTime = Math.ceil((new Date(attemptRecord.locked_until) - new Date()) / 60000);
            return res.status(429).json({ error: `Too many attempts. Please try again in ${waitTime} minutes.` });
        }

        if (password === process.env.VITE_ADMIN_PASSWORD) {
            // Reset attempts on success
            await sql`
                INSERT INTO login_attempts (ip_address, attempts, locked_until)
                VALUES (${ip}, 0, NULL)
                ON CONFLICT (ip_address)
                DO UPDATE SET attempts = 0, locked_until = NULL
            `;
            return res.status(200).json({ success: true });
        } else {
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

            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
