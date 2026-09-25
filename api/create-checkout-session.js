
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';
import { rateLimit } from './_utils/rate-limit.js';
import { validateOrigin } from './_utils/csrf.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Server-side tier definitions — the single source of truth for pricing
const TIERS = {
    '0': { name: 'Starter Task', price: 10 },
    '1': { name: 'Basic Boost', price: 25 },
    '2': { name: 'Growth Pack', price: 50 },
    '3': { name: 'Pro Build', price: 100 },
    '4': { name: 'Advanced Strategy', price: 200 },
    '5': { name: 'Business Accelerator', price: 250 },
    '6': { name: 'Agency Package', price: 500 },
    '7': { name: 'Enterprise Solution', price: 1000 },
};

const HOSTING_TIERS = {
    'managed': { name: 'Managed Hosting', price: 29 },
    'business': { name: 'Business Hosting', price: 60 },
    'premium': { name: 'Premium Hosting + Care', price: 120 },
};

// Allowed origin for redirect URLs
const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://harleygilpin.com';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_DETAILS_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate free-text checkout fields. These end up in the database, the
 * Stripe session, the service agreement, and Linear issues.
 * Returns an error message, or null if valid.
 */
function validateInput({ clientName, clientEmail, projectDetails, deadline }) {
    if (typeof clientName !== 'string' || !clientName.trim() || clientName.length > MAX_NAME_LENGTH) {
        return 'Invalid client name';
    }
    if (typeof clientEmail !== 'string' || clientEmail.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(clientEmail)) {
        return 'Invalid email address';
    }
    if (projectDetails != null && (typeof projectDetails !== 'string' || projectDetails.length > MAX_DETAILS_LENGTH)) {
        return 'Invalid project details';
    }
    if (deadline != null && deadline !== '') {
        const date = new Date(`${deadline}T00:00:00Z`);
        const today = new Date().toISOString().split('T')[0];
        if (typeof deadline !== 'string' || !DATE_PATTERN.test(deadline) || isNaN(date.getTime()) || deadline < today) {
            return 'Invalid deadline';
        }
    }
    return null;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CSRF protection
    const csrf = validateOrigin(req);
    if (!csrf.valid) {
        return res.status(csrf.status).json(csrf.body);
    }

    // Rate limit: 10 checkout attempts per minute per IP
    const rl = await rateLimit(req, { maxRequests: 10, windowMs: 60_000, keyPrefix: 'checkout' });
    if (rl.limited) {
        return res.status(429).json(rl.body);
    }

    try {
        const {
            tierId,
            clientName,
            clientEmail,
            projectDetails,
            deadline,
            hostingTier,
        } = req.body || {};

        // Input validation
        if (!tierId || !clientName || !clientEmail) {
            return res.status(400).json({ error: 'Missing required fields: tierId, clientName, clientEmail' });
        }

        const inputError = validateInput({ clientName, clientEmail, projectDetails, deadline });
        if (inputError) {
            return res.status(400).json({ error: inputError });
        }

        // Server-side tier lookup — never trust client-supplied price.
        // Own-property check so keys like "constructor" don't resolve to Object.prototype.
        const tier = Object.hasOwn(TIERS, tierId) ? TIERS[tierId] : null;
        if (!tier) {
            return res.status(400).json({ error: 'Invalid tier ID' });
        }

        // Validate hosting tier if provided
        let hostingSelection = null;
        if (hostingTier && hostingTier !== 'none') {
            hostingSelection = Object.hasOwn(HOSTING_TIERS, hostingTier) ? HOSTING_TIERS[hostingTier] : null;
            if (!hostingSelection) {
                return res.status(400).json({ error: 'Invalid hosting tier' });
            }
        }

        // Use server-side prices
        const price = tier.price;
        const tierName = tier.name;
        const hostingName = hostingSelection?.name || null;
        const hostingPrice = hostingSelection?.price || 0;

        // Generate Service Agreement
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
        if (hostingSelection) {
            agreementContent += `

12. HOSTING SERVICES ADDENDUM
(a) Scope: Provider agrees to maintain the hosting environment, SSL certificates, and server availability as defined in the selected "${hostingName}" tier.
(b) Availability: Provider aims for 99.9% service uptime. Scheduled maintenance will be communicated in advance.
(c) Cancellation: Hosting is billed monthly. Client may cancel at any time via the customer portal. Access continues until the end of the current billing cycle. No refunds for partial months.
`;
        }

        const { rows } = await sql`
          INSERT INTO orders (tier_name, price, client_name, client_email, project_details, deadline, status, hosting_tier, hosting_price, agreement_content)
          VALUES (${tierName}, ${price}, ${clientName}, ${clientEmail}, ${projectDetails || ''}, ${deadline || ''}, 'pending', ${hostingTier || null}, ${hostingPrice}, ${agreementContent})
          RETURNING id;
        `;

        const orderId = rows[0].id;

        // Build line items array
        const lineItems = [];

        if (hostingSelection) {
            // One-time service fee
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

        // Create Stripe Checkout Session with hardcoded origin
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: hostingSelection ? 'subscription' : 'payment',
            success_url: `${ALLOWED_ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${ALLOWED_ORIGIN}/checkout?tier=${tierId}`,
            customer_email: clientEmail,
            metadata: {
                orderId: orderId.toString(),
                hostingTier: hostingTier || 'none'
            },
        };

        if (hostingSelection) {
            sessionConfig.subscription_data = {
                metadata: {
                    orderId: orderId.toString(),
                    hostingTier: hostingTier
                }
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // Update Order with Session ID
        await sql`
          UPDATE orders 
          SET stripe_session_id = ${session.id}
          WHERE id = ${orderId}
        `;

        return res.status(200).json({ url: session.url });

    } catch {
        console.error('Checkout API error:', { timestamp: new Date().toISOString() });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
