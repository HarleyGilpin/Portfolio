
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            tierId,
            tierName,
            price,
            clientName,
            clientEmail,
            projectDetails,
            deadline,
            // Hosting add-on data
            hostingTier,
            hostingName,
            hostingPrice
        } = req.body;

        // 1. Create Order in Database (Pending)
        // Create table if it doesn't exist
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
            hosting_tier VARCHAR(100),
            hosting_price DECIMAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;

        // Add hosting columns if they don't exist (for existing tables)
        try {
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS hosting_tier VARCHAR(100);`;
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS hosting_price DECIMAL;`;
        } catch (e) {
            // Columns might already exist, ignore error
            console.log('Hosting columns may already exist:', e.message);
        }

        const { rows } = await sql`
          INSERT INTO orders (tier_name, price, client_name, client_email, project_details, deadline, status, hosting_tier, hosting_price)
          VALUES (${tierName}, ${price}, ${clientName}, ${clientEmail}, ${projectDetails}, ${deadline}, 'pending', ${hostingTier || null}, ${hostingPrice || 0})
          RETURNING id;
        `;

        const orderId = rows[0].id;

        // 2. Build line items array
        const lineItems = [];

        // One-time service fee (always present)
        if (hostingTier) {
            // For subscription mode: one-time items need price_data with recurring null workaround
            // Stripe subscription mode requires all items to be recurring OR use invoice_creation
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: tierName,
                        description: `Project execution for ${clientName}`,
                    },
                    unit_amount: price * 100,
                    recurring: { interval: 'month', interval_count: 1 }
                },
                quantity: 1,
            });

            // Monthly hosting subscription
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: hostingName,
                        description: `Monthly hosting and maintenance for ${clientName}`,
                    },
                    unit_amount: hostingPrice * 100,
                    recurring: { interval: 'month' }
                },
                quantity: 1,
            });
        } else {
            // No hosting - simple one-time payment
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: tierName,
                        description: `Project execution for ${clientName}`,
                    },
                    unit_amount: price * 100,
                },
                quantity: 1,
            });
        }

        // 3. Create Stripe Checkout Session
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: hostingTier ? 'subscription' : 'payment',
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/checkout?tier=${tierId}`,
            customer_email: clientEmail,
            metadata: {
                orderId: orderId.toString(),
                hostingTier: hostingTier || 'none'
            },
        };

        // For subscriptions, cancel after first payment for the service fee
        if (hostingTier) {
            sessionConfig.subscription_data = {
                metadata: {
                    orderId: orderId.toString(),
                    includesOneTimeService: 'true'
                }
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // 4. Update Order with Session ID
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
