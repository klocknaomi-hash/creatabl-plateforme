import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const { db } = await import('../lib/db');
  const { users } = await import('../lib/db/schema');
  const { eq } = await import('drizzle-orm');

  const client = await clerkClient();
  const emails = ['klock.naomi@gmail.com', 'klocknaomi@gmail.com'];

  for (const email of emails) {
    console.log(`\n--- Processing email: ${email} ---`);
    console.log(`Searching for ${email} in Clerk...`);
    
    try {
      const existing = await client.users.getUserList({
        emailAddress: [email]
      });
      
      if (existing.data.length > 0) {
        const clerkUserId = existing.data[0].id;
        console.log(`Found Clerk user ID: ${clerkUserId}`);
        
        // Update Clerk metadata
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            plan: 'business',
            selectedPlan: 'business',
            onboardingStep: 'done',
            trialEndsAt: '2099-12-31T00:00:00.000Z',
            trialPlan: 'business',
            trialStartedAt: new Date().toISOString()
          }
        });
        console.log(`Successfully updated publicMetadata for ${email} in Clerk.`);

        // Update in database using Drizzle
        console.log(`Updating Neon database user...`);
        const updateResult = await db.update(users).set({
          plan: 'business',
          selectedPlan: 'business',
          trialEndsAt: new Date('2099-12-31T00:00:00.000Z'),
          trialStartedAt: new Date(),
          isSubscribed: true,
          onboardingCompleted: true,
        }).where(eq(users.clerkId, clerkUserId)).returning();

        if (updateResult.length > 0) {
          console.log(`Successfully updated database record for ${email}`);
        } else {
          console.log(`No user record found in DB for clerkId: ${clerkUserId}. Trying to search by email...`);
          const updateResultByEmail = await db.update(users).set({
            clerkId: clerkUserId,
            plan: 'business',
            selectedPlan: 'business',
            trialEndsAt: new Date('2099-12-31T00:00:00.000Z'),
            trialStartedAt: new Date(),
            isSubscribed: true,
            onboardingCompleted: true,
          }).where(eq(users.email, email)).returning();

          if (updateResultByEmail.length > 0) {
            console.log(`Successfully updated database record by email for ${email}`);
          } else {
            console.log(`No database record found for ${email}. It will be created and synced upon first login!`);
          }
        }
      } else {
        console.log(`User ${email} does not exist in Clerk yet. Doing database-only sync if email exists...`);
        const updateResultByEmail = await db.update(users).set({
          plan: 'business',
          selectedPlan: 'business',
          trialEndsAt: new Date('2099-12-31T00:00:00.000Z'),
          trialStartedAt: new Date(),
          isSubscribed: true,
          onboardingCompleted: true,
        }).where(eq(users.email, email)).returning();

        if (updateResultByEmail.length > 0) {
          console.log(`Successfully updated database record by email for ${email}`);
        } else {
          console.log(`No database record found for ${email}. It will be created and synced upon login!`);
        }
      }
    } catch (err: any) {
      console.error(`Error updating account ${email}:`, err.message || err);
    }
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
