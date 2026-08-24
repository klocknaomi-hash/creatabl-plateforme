import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { clerkClient } from '@clerk/nextjs/server';

async function main() {
  const email = 'launch-test-' + Date.now() + '@creatabl-ia.com';
  const client = await clerkClient();

  // Create a brand new user in Clerk only
  const newUser = await client.users.createUser({
    emailAddress: [email],
    password: 'TestCreatabl2026!',
    firstName: 'Launch',
    lastName: 'Tester',
    // We don't set publicMetadata to let the app do it if it wants
  });

  console.log(`Created user in Clerk: ${email} (${newUser.id})`);

  // Generate a sign-in token to bypass login form
  const tokenObj = await client.signInTokens.createSignInToken({
    userId: newUser.id,
    expiresInSeconds: 600, // 10 minutes
  });

  console.log(`\nDirect login URL for ${email}:\n${tokenObj.url}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to generate login URL:", err);
  process.exit(1);
});
