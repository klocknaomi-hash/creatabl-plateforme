const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const client = await clerkClient();

  const email = 'business-test@creatabl-ia.com';
  console.log(`Searching for user: ${email}`);

  try {
    const existing = await client.users.getUserList({
      emailAddress: [email]
    });

    if (existing.data.length === 0) {
      console.error(`User ${email} not found in Clerk.`);
      process.exit(1);
    }

    const user = existing.data[0];
    const userId = user.id;
    console.log(`Found User ID: ${userId}`);

    console.log("Creating SignInToken...");
    const tokenObj = await client.signInTokens.createSignInToken({
      userId: userId,
      expiresInSeconds: 300 // 5 minutes
    });

    console.log("\n=== SUCCESS ===");
    console.log(`Token: ${tokenObj.token}`);
    console.log(`URL: ${tokenObj.url}`);
    
    // Test the URL format
    const localUrl = `http://localhost:3000/sign-in?token=${tokenObj.token}`;
    console.log(`Local Login URL: ${localUrl}`);

  } catch (err) {
    console.error("Error creating SignInToken:", err);
  }

  process.exit(0);
}

main();
