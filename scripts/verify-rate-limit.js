

const API_URL = 'http://localhost:3000/api/login';

async function testRateLimit() {
    console.log('Starting rate limit test...');

    // 1. Send 5 failed attempts
    for (let i = 1; i <= 5; i++) {
        console.log(`Sending failed attempt ${i}...`);
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'wrong_password' })
        });

        if (res.status === 401) {
            console.log(`Attempt ${i} failed as expected (401).`);
        } else {
            console.error(`Attempt ${i} unexpected status: ${res.status}`);
        }
    }

    // 2. Send 6th attempt (should be locked out)
    console.log('Sending 6th attempt (expecting lockout)...');
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'wrong_password' })
    });

    if (res.status === 429) {
        console.log('SUCCESS: Account locked out (429).');
        const data = await res.json();
        console.log('Error message:', data.error);
    } else {
        console.error(`FAILURE: Expected 429, got ${res.status}`);
    }
}

testRateLimit();
