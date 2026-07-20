import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const { db } = await import('../lib/db');
  const { users } = await import('../lib/db/schema');
  const { eq } = await import('drizzle-orm');

  const email = 'integrations-support@canva.com';
  console.log(`Checking account status for: ${email}\n`);

  // 1. Check Neon Database
  try {
    const dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUser.length > 0) {
      console.log('--- NEON DATABASE RECORD FOUND ---');
      console.log(JSON.stringify(dbUser[0], null, 2));
    } else {
      console.log('--- NO NEON DATABASE RECORD FOUND ---');
    }
  } catch (err: any) {
    console.error('Error querying Neon database:', err.message || err);
  }

  // 2. Check Clerk
  try {
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      emailAddress: [email],
    });

    if (clerkUsers.data.length > 0) {
      const u = clerkUsers.data[0];
      console.log('\n--- CLERK USER RECORD FOUND ---');
      console.log(`Clerk ID: ${u.id}`);
      console.log(`Email: ${u.emailAddresses.map(e => e.emailAddress).join(', ')}`);
      console.log(`Public Metadata:`, JSON.stringify(u.publicMetadata, null, 2));
      console.log(`Password Enabled: ${u.passwordEnabled}`);
    } else {
      console.log('\n--- NO CLERK USER RECORD FOUND ---');
    }
  } catch (err: any) {
    console.error('Error querying Clerk:', err.message || err);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
