import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const { db } = await import('../lib/db');
  const { users } = await import('../lib/db/schema');

  console.log("Listing Neon Database users...");
  try {
    const dbUsers = await db.select().from(users);
    console.log(`Found ${dbUsers.length} users in DB:`);
    for (const u of dbUsers) {
      console.log(`- ${u.email} (Clerk ID: ${u.clerkId}, Plan: ${u.plan}, Status: ${u.subscriptionStatus})`);
    }
  } catch (err: any) {
    console.error("Error fetching DB users:", err.message || err);
  }

  console.log("\nListing Clerk users...");
  try {
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList();
    console.log(`Found ${clerkUsers.data.length} users in Clerk:`);
    for (const u of clerkUsers.data) {
      console.log(`- ${u.emailAddresses.map(e => e.emailAddress).join(', ')} (ID: ${u.id})`);
    }
  } catch (err: any) {
    console.error("Error fetching Clerk users:", err.message || err);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
