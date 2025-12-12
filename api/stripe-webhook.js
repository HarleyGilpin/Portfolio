import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook secret from Stripe Dashboard (set in your environment variables)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
    api: {
        bodyParser: false, // Stripe requires raw body for signature verification
    },
};

// Buffer to collect raw body data
function buffer(readable) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readable.on('data', (chunk) => chunks.push(chunk));
        readable.on('end', () => resolve(Buffer.concat(chunks)));
        readable.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawBody = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle specific events
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object);
            break;

        case 'customer.subscription.deleted':
            await handleSubscriptionCanceled(event.data.object);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
}



/**
 * Handle checkout.session.completed event
 * Update the order status in the database
 */
async function handleCheckoutCompleted(session) {
    console.log('Checkout completed:', session.id);

    const orderId = session.metadata?.orderId;
    if (!orderId) {
        console.log('No orderId in session metadata');
        return;
    }

    try {
        await sql`
            UPDATE orders 
            SET status = 'paid'
            WHERE id = ${parseInt(orderId)}
        `;
        console.log(`Order ${orderId} marked as paid`);
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

/**
 * Handle customer.subscription.deleted event
 * Update order status when hosting is canceled
 */
async function handleSubscriptionCanceled(subscription) {
    console.log('Subscription canceled:', subscription.id);

    const orderId = subscription.metadata?.orderId;
    if (!orderId) return;

    try {
        await sql`
            UPDATE orders 
            SET status = 'hosting_canceled'
            WHERE id = ${parseInt(orderId)}
        `;
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}
