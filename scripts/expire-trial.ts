import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const { clerkClient } = await import('@clerk/nextjs/server');
  const email = "starter-test@creatabl-ia.com";
  
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error("User not found in DB");
    return;
  }

  const pastDate = new Date("2020-01-01T00:00:00.000Z");

  // 1. Update Neon DB
  await db
    .update(users)
    .set({
      plan: "starter",
      trialEndsAt: pastDate,
      subscriptionStatus: "trialing",
      stripeSubscriptionId: null,
      isSubscribed: false,
    })
    .where(eq(users.id, user.id));

  // 2. Update Clerk Metadata
  const client = await clerkClient();
  await client.users.updateUserMetadata(user.clerkId, {
    publicMetadata: {
      plan: "starter",
      trialEndsAt: pastDate.toISOString(),
      trialPlan: "starter",
      subscriptionActive: false,
      onboardingStep: "done",
    },
  });

  console.log(`Successfully expired trial for ${email}. trialEndsAt set to ${pastDate.toISOString()}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
