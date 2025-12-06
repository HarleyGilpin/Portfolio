
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { session_id } = req.query;

    if (!session_id) {
        return res.status(400).json({ error: 'Missing session_id' });
    }

    try {
        // 1. Retrieve the session from Stripe to verify payment status
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Payment not successful' });
        }

        const orderId = session.metadata.orderId;

        // 2. Generate Agreement Text
        // In a real app, this would be a robust PDF generation or complex template
        const currentDate = new Date().toLocaleDateString();
        const agreementText = `
SERVICE AGREEMENT

This Agreement is made on ${currentDate} between Harley Gilpin ("Provider") and the Client associated with Order #${orderId}.

1. SERVICES
Provider agrees to deliver the services described in the "${session.line_items?.data?.[0]?.description || 'Selected Tier'}" package.

2. PAYMENT
Client has paid a total of $${session.amount_total / 100} USD.

3. TIMELINE
Work will commence immediately. Provider agrees to maintain clear communication throughout the project lifecycle.

4. TERMS
This output serves as a binding digital confirmation of the paid services.
    `.trim();

        // 3. Update Order in Database
        // We update the status to 'paid' and save the agreement
        const { rows } = await sql`
      UPDATE orders 
      SET status = 'paid', agreement_content = ${agreementText}
      WHERE id = ${orderId} AND stripe_session_id = ${session_id}
      RETURNING *;
    `;

        if (rows.length === 0) {
            // Only fetch if already 'paid'
            const { rows: existingRows } = await sql`SELECT * FROM orders WHERE stripe_session_id = ${session_id}`;
            if (existingRows.length > 0) {
                return res.status(200).json({ order: existingRows[0] });
            }
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json({ order: rows[0] });

    } catch (error) {
        console.error('Verify API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
