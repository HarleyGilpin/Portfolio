
export default async function handler(req, res) {
    const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
    const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;

    if (!LINEAR_API_KEY || !LINEAR_TEAM_ID) {
        return res.status(500).json({
            error: 'Missing Env Vars',
            details: {
                hasKey: !!LINEAR_API_KEY,
                hasTeamId: !!LINEAR_TEAM_ID
            }
        });
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
                        title: 'Test Task from Vercel Production',
                        description: 'If you see this, the Linear Integration is working!',
                        priority: 3
                    }
                }
            }),
        });

        const data = await response.json();

        if (data.errors) {
            return res.status(400).json({ error: 'Linear API Error', details: data.errors });
        }

        return res.status(200).json({
            success: true,
            message: 'Task created!',
            url: data.data.issueCreate.issue.url
        });

    } catch (error) {
        return res.status(500).json({ error: 'Fetch Error', details: error.message });
    }
}
