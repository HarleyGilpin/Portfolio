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
        case 'invoice.paid':
            await handleInvoicePaid(event.data.object);
            break;

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
 * Handle invoice.paid event
 * After the first invoice is paid, remove the one-time service fee from the subscription
 */
async function handleInvoicePaid(invoice) {
    console.log('Invoice paid:', invoice.id);

    // Only process if this is a subscription invoice
    if (!invoice.subscription) return;

    // Check if this is the first invoice (billing_reason = 'subscription_create')
    if (invoice.billing_reason !== 'subscription_create') {
        console.log('Not the first invoice, skipping service fee removal');
        return;
    }

    try {
        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

        // Check if this subscription was marked as having a one-time service
        if (subscription.metadata?.includesOneTimeService !== 'true') {
            console.log('Subscription does not include one-time service, skipping');
            return;
        }

        // Find the service fee line item (the one that's NOT for hosting)
        // Service items have "Project execution" in their description
        const subscriptionItems = await stripe.subscriptionItems.list({
            subscription: subscription.id,
        });

        for (const item of subscriptionItems.data) {
            // Get the price/product details
            const price = await stripe.prices.retrieve(item.price.id, {
                expand: ['product']
            });

            // Check if this is the service fee (not hosting)
            const productName = price.product.name || '';
            const productDesc = price.product.description || '';

            // Service items contain "Project execution" or tier names like "Pro Build", "Enterprise Solution"
            // Hosting items contain "Hosting" in the name
            if (!productName.toLowerCase().includes('hosting')) {
                console.log(`Removing one-time service item: ${productName}`);

                // Delete the subscription item (removes it from future invoices)
                await stripe.subscriptionItems.del(item.id, {
                    proration_behavior: 'none', // Don't prorate, it was a one-time charge
                });

                console.log(`Successfully removed service item from subscription ${subscription.id}`);
            }
        }

        // Update the subscription metadata to mark service as removed
        await stripe.subscriptions.update(subscription.id, {
            metadata: {
                ...subscription.metadata,
                includesOneTimeService: 'removed',
                serviceRemovedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error removing service fee:', error);
        throw error;
    }
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
