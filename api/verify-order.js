
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

        // Check payment status - subscriptions show 'paid' after first invoice,
        // but initially show 'unpaid' until invoice processes
        // For subscriptions, also check if subscription was created successfully
        const isPaid = session.payment_status === 'paid';
        const isSubscriptionComplete = session.mode === 'subscription' && session.subscription;

        if (!isPaid && !isSubscriptionComplete) {
            return res.status(400).json({ error: 'Payment not successful', details: { payment_status: session.payment_status, mode: session.mode } });
        }

        const orderId = session.metadata.orderId;

        // 2. Generate Agreement Text
        // In a real app, this would be a robust PDF generation or complex template
        const currentDate = new Date().toLocaleDateString();
        const agreementText = `
SERVICE AGREEMENT

This Agreement is made on ${currentDate} between Harley Gilpin ("Provider") and the Client associated with Order #${orderId} ("Client").

1. SERVICES
Provider agrees to deliver the services described in the "${session.line_items?.data?.[0]?.description || 'Selected Tier'}" package.

2. PAYMENT
Client has paid a total of $${session.amount_total / 100} USD.

3. RELATIONSHIP OF PARTIES
Provider is an independent contractor. Nothing in this Agreement shall be construed to create a partnership, joint venture, or employer-employee relationship.

4. INTELLECTUAL PROPERTY
Upon full payment, Client shall own all rights, title, and interest in the final deliverables created specifically for Client. Provider retains ownership of any pre-existing materials, tools, or methodologies used.

5. CONFIDENTIALITY
(a) Definition: "Confidential Information" includes all non-public information disclosed by either party, including but not limited to: business plans, technical data, product ideas, trade secrets, customer lists, pricing information, login credentials, and proprietary methodologies.
(b) Mutual Obligations: Both Provider and Client agree to hold each other's Confidential Information in strict confidence, using at least the same degree of care used to protect their own confidential information.
(c) Exceptions: This obligation does not apply to information that: (i) was already publicly available, (ii) was independently developed without use of the other party's information, (iii) was lawfully received from a third party, or (iv) is required to be disclosed by law or court order.
(d) Duration: These confidentiality obligations shall survive for two (2) years following the completion or termination of this Agreement.

6. WARRANTIES & LIMITATION OF LIABILITY
Provider warrants that Services will be performed in a professional manner. EXCEPT AS EXPRESSLY STATED, PROVIDER MAKES NO WARRANTIES, EXPRESS OR IMPLIED.
TO THE FULLEST EXTENT PERMITTED BY LAW, PROVIDER'S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT. PROVIDER SHALL NOT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, OR INCIDENTAL DAMAGES.

7. TERMINATION
Either party may terminate this Agreement if the other party materially breaches its terms.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the Provider's principal place of business.

9. ENTIRE AGREEMENT
This document serves as the binding confirmation of the services and terms agreed to by the parties.
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
