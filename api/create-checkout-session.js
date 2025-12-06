
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { tierId, tierName, price, clientName, clientEmail, projectDetails, deadline } = req.body;

        // 1. Create Order in Database (Pending)
        // Ensure table exists (simple check for dev/demo purposes)
        await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        tier_name VARCHAR(255),
        price DECIMAL,
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        project_details TEXT,
        deadline VARCHAR(255),
        status VARCHAR(50),
        stripe_session_id VARCHAR(255),
        agreement_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        const { rows } = await sql`
      INSERT INTO orders (tier_name, price, client_name, client_email, project_details, deadline, status)
      VALUES (${tierName}, ${price}, ${clientName}, ${clientEmail}, ${projectDetails}, ${deadline}, 'pending')
      RETURNING id;
    `;

        const orderId = rows[0].id;

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: tierName,
                            description: `Project execution for ${clientName}`,
                        },
                        unit_amount: price * 100, // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/checkout?tier=${tierId}`,
            metadata: {
                orderId: orderId.toString()
            },
        });

        // 3. Update Order with Session ID
        await sql`
      UPDATE orders 
      SET stripe_session_id = ${session.id}
      WHERE id = ${orderId}
    `;

        return res.status(200).json({ url: session.url });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
