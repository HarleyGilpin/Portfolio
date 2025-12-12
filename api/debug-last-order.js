
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
    const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;

    // Security: persistent simple guard (optional, but good practice)
    // For now, open for debugging

    try {
        // 1. Get the most recent order
        const { rows } = await sql`
            SELECT * FROM orders 
            ORDER BY id DESC 
            LIMIT 1
        `;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No orders found in database' });
        }

        const order = rows[0];

        // 2. If 'trigger=true' is passed, try to create the Linear task manually
        let linearResult = 'Not triggered';
        if (req.query.trigger === 'true') {
            const description = `
**Client:** ${order.client_name}
**Email:** ${order.client_email}
**Service Tier:** ${order.tier_name}
**Hosting:** ${order.hosting_tier || 'None'}
**Deadline:** ${order.deadline || 'No specific date'}

**Project Details:**
${order.project_details}

---
*Manually Triggered Debug*
            `.trim();

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
                                title: `DEBUG: New Project: ${order.client_name}`,
                                description: description,
                                priority: 2
                            }
                        }
                    }),
                });

                const data = await response.json();
                linearResult = data;

            } catch (e) {
                linearResult = { error: e.message };
            }
        }

        return res.status(200).json({
            status: 'Check Complete',
            latest_order: {
                id: order.id,
                client: order.client_name,
                status: order.status, // 'pending' means webhook failed. 'paid' means webhook worked.
                created_at: order.created_at
            },
            env_check: {
                has_linear_key: !!LINEAR_API_KEY,
                has_team_id: !!LINEAR_TEAM_ID
            },
            linear_debug_attempt: linearResult
        });

    } catch (error) {
        return res.status(500).json({ error: 'Database Error', details: error.message });
    }
}
