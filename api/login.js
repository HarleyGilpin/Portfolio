export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    if (password === process.env.VITE_ADMIN_PASSWORD) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ error: 'Invalid password' });
    }
}
