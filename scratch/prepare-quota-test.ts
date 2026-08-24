import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from '../lib/db';
import { users, posts } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const email = 'business-test@creatabl-ia.com';
  console.log(`Setting up quota test for ${email}...`);

  const userRows = await db.select().from(users).where(eq(users.email, email));
  if (userRows.length === 0) {
    console.error("User not found!");
    process.exit(1);
  }

  const userId = userRows[0].id;

  // Set plan to free, monthlyAiCount to 20, and ensure trial is valid
  await db.update(users)
    .set({
      plan: 'free',
      trialEndsAt: new Date('2099-12-31T00:00:00.000Z'),
      monthlyAiCount: 20
    })
    .where(eq(users.id, userId));

  console.log("Database updated: plan=free, monthlyAiCount=20, trial=valid");
  process.exit(0);
}

main().catch(console.error);
