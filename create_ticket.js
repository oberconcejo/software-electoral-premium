import 'dotenv/config';

async function createTicket() {
  const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: 'user_3IFD8szRfWqXKGXWIacWXHRWaV2',
      expires_in_seconds: 2592000 // 30 days
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

createTicket();
