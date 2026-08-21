import 'dotenv/config';

async function checkUser() {
  const response = await fetch('https://api.clerk.com/v1/users?email_address=oberosorio1@gmail.com', {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

checkUser();
