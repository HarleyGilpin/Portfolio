
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

        // 2. Generate Full Service Agreement
        const currentDate = new Date().toLocaleDateString();
        let agreementContent = `
SERVICE AGREEMENT

This Agreement is made on ${currentDate} between Harley Gilpin ("Provider") and ${clientName} ("Client").

1. SERVICES
Provider agrees to deliver the digital services described in the "${tierName}" package. Services are performed as an independent contractor.

2. PAYMENT
Full payment of $${price} USD is required upfront to commence work.

3. INTELLECTUAL PROPERTY
Upon full payment, Client shall own all rights, title, and interest in the final deliverables created specifically for Client. Provider retains ownership of pre-existing materials and methodologies.

4. CONFIDENTIALITY
(a) Definition: "Confidential Information" includes business plans, technical data, trade secrets, customer lists, credentials, and proprietary methodologies.
(b) Mutual Obligations: Both parties agree to protect each other's confidential information with the same care used for their own.
(c) Exceptions: Does not apply to publicly available info, independently developed info, lawfully received info, or legally required disclosures.
(d) Duration: Confidentiality obligations survive for 2 years after project completion.

5. LIMITATION OF LIABILITY
To the fullest extent permitted by law, Provider's total liability shall not exceed the total fees paid by Client. Provider is not liable for indirect or consequential damages.

6. INDEMNIFICATION
Client agrees to indemnify and hold Provider harmless against any claims, damages, or expenses arising from materials provided by Client (e.g., images, text) that infringe on third-party rights.

7. PORTFOLIO USAGE
Provider retains the right to reproduce, publish, and display the deliverables in Provider's portfolios and websites for the purpose of recognition of creative excellence or professional advancement.

8. NON-EXCLUSIVITY
This Agreement does not create an exclusive relationship. Provider is free to provide similar services to other clients, including competitors of Client.

9. FORCE MAJEURE
Provider is not liable for any failure or delay in performance due to causes beyond reasonable control, including acts of God, internet outages, or illness.

10. TERMINATION
Either party may terminate if the other materially breaches terms. Refunds are not provided for work already performed.

11. GOVERNING LAW
This Agreement is governed by the laws of the Provider's principal place of business.
`.trim();

        // Append Hosting Addendum if applicable
        if (hostingTier) {
            agreementContent += `

12. HOSTING SERVICES ADDENDUM
(a) Scope: Provider agrees to maintain the hosting environment, SSL certificates, and server availability as defined in the selected "${hostingName}" tier.
(b) Availability: Provider aims for 99.9% service uptime. Scheduled maintenance will be communicated in advance.
(c) Cancellation: Hosting is billed monthly. Client may cancel at any time via the customer portal. Access continues until the end of the current billing cycle. No refunds for partial months.
`;
        }

        const { rows } = await sql`
          INSERT INTO orders (tier_name, price, client_name, client_email, project_details, deadline, status, hosting_tier, hosting_price, agreement_content)
          VALUES (${tierName}, ${price}, ${clientName}, ${clientEmail}, ${projectDetails}, ${deadline}, 'pending', ${hostingTier || null}, ${hostingPrice || 0}, ${agreementContent})
          RETURNING id;
        `;

        const orderId = rows[0].id;

        // 2. Build line items array
        const lineItems = [];

        // One-time service fee (always present)
        if (hostingTier) {
            // For subscription mode: one-time items are passed without recurring data
            // Stripe Checkout supports mixed one-time and recurring items in subscription mode
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: tierName,
                        description: `Project execution for ${clientName}`,
                    },
                    unit_amount: price * 100,
                    // No recurring field means it's one-time
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

        // For subscriptions, payment behavior defaults to 'allow_incomplete'
        if (hostingTier) {
            sessionConfig.subscription_data = {
                metadata: {
                    orderId: orderId.toString(),
                    hostingTier: hostingTier
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
