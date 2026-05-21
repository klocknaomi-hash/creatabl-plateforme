import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const testAccounts = [
  {
    email: 'starter-test@creatabl-ia.com',
    password: 'TestCreatabl2026!',
    plan: 'starter',
    firstName: 'Test',
    lastName: 'Starter'
  },
  {
    email: 'pro-test@creatabl-ia.com', 
    password: 'TestCreatabl2026!',
    plan: 'pro',
    firstName: 'Test',
    lastName: 'Pro'
  },
  {
    email: 'business-test@creatabl-ia.com',
    password: 'TestCreatabl2026!',
    plan: 'business',
    firstName: 'Test',
    lastName: 'Business'
  }
];

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const { db } = await import('../lib/db');
  const { users } = await import('../lib/db/schema');
  
  const client = await clerkClient();

  
  for (const account of testAccounts) {
    let clerkUserId = '';
    
    try {
      // 1. Check if user exists in Clerk
      const existing = await client.users.getUserList({
        emailAddress: [account.email]
      });
      
      if (existing.data.length > 0) {
        clerkUserId = existing.data[0].id;
        console.log(`User already exists in Clerk: ${account.email} (${clerkUserId})`);
        
        // Update public metadata
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            onboardingStep: "done",
            trialEndsAt: "2099-12-31T00:00:00.000Z",
            trialPlan: account.plan,
            trialStartedAt: new Date().toISOString()
          }
        });
        console.log(`Updated publicMetadata for ${account.email} in Clerk.`);
      } else {
        // Create user in Clerk
        const newUser = await client.users.createUser({
          emailAddress: [account.email],
          password: account.password,
          firstName: account.firstName,
          lastName: account.lastName,
          publicMetadata: {
            onboardingStep: "done",
            trialEndsAt: "2099-12-31T00:00:00.000Z",
            trialPlan: account.plan,
            trialStartedAt: new Date().toISOString()
          }
        });
        clerkUserId = newUser.id;
        console.log(`Created user in Clerk: ${account.email} (${clerkUserId})`);
      }
      
      // 2. Insert/Update in DB using Drizzle
      await db.insert(users).values({
        clerkId: clerkUserId,
        email: account.email,
        name: `${account.firstName} ${account.lastName}`,
        plan: account.plan,
        selectedPlan: account.plan,
        trialEndsAt: new Date('2099-12-31T00:00:00.000Z'),
        trialStartedAt: new Date(),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        createdAt: new Date(),
      }).onConflictDoUpdate({
        target: users.clerkId,
        set: {
          plan: account.plan,
          selectedPlan: account.plan,
          trialEndsAt: new Date('2099-12-31T00:00:00.000Z'),
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        }
      });
      
      console.log(`Successfully updated database record for ${account.email}`);
    } catch (err: any) {
      console.error(`Error processing ${account.email}:`, err.message || err);
    }
  }
  
  // Format and print the requested output
  console.log(`
╔══════════════════════════════════════╗
║        COMPTES TEST CREATABL         ║
╠══════════════════════════════════════╣
║ STARTER                              ║
║ Email: starter-test@creatabl-ia.com  ║
║ MDP:   TestCreatabl2026!             ║
║ Plan:  Starter (permanent)           ║
╠══════════════════════════════════════╣
║ PRO                                  ║
║ Email: pro-test@creatabl-ia.com      ║
║ MDP:   TestCreatabl2026!             ║
║ Plan:  Pro (permanent)               ║
╠══════════════════════════════════════╣
║ BUSINESS                             ║
║ Email: business-test@creatabl-ia.com ║
║ MDP:   TestCreatabl2026!             ║
║ Plan:  Business (permanent)          ║
╚══════════════════════════════════════╝
`);
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
