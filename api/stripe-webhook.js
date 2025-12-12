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

        case 'customer.subscription.updated':
            // Check if cancellation was just scheduled
            const prev = event.data.previous_attributes;
            if (prev && 'cancel_at_period_end' in prev && event.data.object.cancel_at_period_end === true) {
                await handleSubscriptionUpdated(event.data.object);
            }
            break;

        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
}

/**
 * Handle customer.subscription.updated event
 * Notify when a user SCHEDULES a cancellation (e.g. at end of month)
 */
async function handleSubscriptionUpdated(subscription) {
    console.log('Subscription cancellation scheduled:', subscription.id);

    const orderId = subscription.metadata?.orderId;
    const hostingTier = subscription.metadata?.hostingTier || 'Unknown Tier';

    // Get cancellation date
    const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString();

    await createLinearIssue(
        `Warning: Hosting Cancellation Scheduled - Order #${orderId || 'Unknown'}`,
        `Client has requested cancellation effective on **${endDate}**.\n\nHosting Tier: ${hostingTier}\n\nTask: Prepare to offboard server on this date.`,
        2 // High Priority
    );
}

/**
 * Handle invoice.payment_failed event
 * Alert Linear when a recurring payment fails
 */
async function handlePaymentFailed(invoice) {
    console.log('Payment failed:', invoice.id);

    const email = invoice.customer_email || 'Unknown Email';
    const amount = invoice.amount_due / 100; // Convert cents to dollars
    const payUrl = invoice.hosted_invoice_url;

    // Create URGENT task
    await createLinearIssue(
        `URGENT: Payment Failed - ${email} ($${amount})`,
        `**Revenue Alert**
        
Client: ${email}
Amount Overdue: $${amount}
Reason: ${invoice.billing_reason || 'Unknown'}

**Action Required:**
1. Check Stripe Dashboard.
2. Contact client to update payment method.
3. Consider pausing hosting if unresolved.

[View Invoice in Stripe](${payUrl})`,
        1 // Urgent Priority
    );
}



/**
 * Create a task in Linear
 */
async function createLinearIssue(title, description, priority = 2) {
    const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
    const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;

    if (!LINEAR_API_KEY || !LINEAR_TEAM_ID) {
        console.warn('Linear API Key or Team ID missing. Skipping issue creation.');
        return;
    }

    try {
        const response = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': LINEAR_API_KEY,
            },
            body: JSON.stringify({
                query: `
            mutation IssueCreate($input: IssueCreateInput!) {
              issueCreate(input: $input) {
                success
                issue {
                  id
                  title
                  url
                }
              }
            }
          `,
                variables: {
                    input: {
                        teamId: LINEAR_TEAM_ID,
                        title: title,
                        description: description,
                        priority: priority // 1=Urgent, 2=High, 3=Normal, 4=Low
                    }
                }
            }),
        });

        const data = await response.json();
        if (data.errors) {
            console.error('Linear API errors:', data.errors);
        } else {
            console.log('Linear issue created:', data.data.issueCreate.issue.url);
        }
    } catch (error) {
        console.error('Error creating Linear issue:', error);
    }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription) {
    console.log('Subscription canceled:', subscription.id);
    const orderId = subscription.metadata?.orderId;
    const hostingTier = subscription.metadata?.hostingTier || 'Unknown Tier';

    // Fallback email logic
    const customerId = subscription.customer;
    let customerEmail = 'Unknown Email';
    try {
        if (customerId) {
            const customer = await stripe.customers.retrieve(customerId);
            if (!customer.deleted) customerEmail = customer.email;
        }
    } catch (e) { console.error(e); }

    try {
        if (orderId) {
            await sql`UPDATE orders SET status = 'hosting_canceled' WHERE id = ${parseInt(orderId)}`;
        }
        await createLinearIssue(
            `URGENT: Hosting Canceled - Order #${orderId || 'Unknown'}`,
            `User (${customerEmail}) has canceled their hosting subscription.\n\nHosting Tier: ${hostingTier}\nSubscription ID: ${subscription.id}\n\nPlease proceed with server offboarding.`,
            1
        );
    } catch (error) {
        console.error('Error handling usage cancellation:', error);
    }
}

async function handleCheckoutCompleted(session) {
    console.log('Checkout completed:', session.id);
    const orderId = session.metadata?.orderId;
    if (!orderId) {
        console.log('No orderId in session metadata');
        return;
    }

    try {
        // 1. Mark as Paid and Fetch Details
        const result = await sql`
            UPDATE orders 
            SET status = 'paid'
            WHERE id = ${parseInt(orderId)}
            RETURNING *
        `;

        console.log(`Order ${orderId} marked as paid`);

        // 2. Create Linear Task for Onboarding
        if (result.rows.length > 0) {
            const order = result.rows[0];
            const description = `
**Client:** ${order.client_name}
**Email:** ${order.client_email}
**Service Tier:** ${order.tier_name}
**Hosting:** ${order.hosting_tier || 'None'}
**Deadline:** ${order.deadline || 'No specific date'}

**Project Details:**
${order.project_details}

---
*Created via Stripe Webhook*
            `.trim();

            await createLinearIssue(
                `New Project: ${order.client_name} - ${order.tier_name}`,
                description,
                2
            );

            // 3. CHECKPOINT: Mark as onboarding_started to prove we got here
            await sql`
                UPDATE orders 
                SET status = 'onboarding_started'
                WHERE id = ${parseInt(orderId)}
            `;
        }

    } catch (error) {
        console.error('Error updating order status:', error);
    }
}
