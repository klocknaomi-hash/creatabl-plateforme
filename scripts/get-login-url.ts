import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { clerkClient } from '@clerk/nextjs/server';

async function main() {
  const email = process.argv[2] || 'starter-test@creatabl-ia.com';
  const client = await clerkClient();

  const existing = await client.users.getUserList({
    emailAddress: [email],
  });

  if (existing.data.length === 0) {
    console.error(`User ${email} not found in Clerk.`);
    process.exit(1);
  }

  const userId = existing.data[0].id;
  const tokenObj = await client.signInTokens.createSignInToken({
    userId: userId,
    expiresInSeconds: 600, // 10 minutes
  });

  console.log(`\nDirect login URL for ${email}:\n${tokenObj.url}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to generate login URL:", err);
  process.exit(1);
});
