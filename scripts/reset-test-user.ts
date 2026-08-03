import { db } from '../lib/db';
import { users, posts, socialAccounts } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function cleanUser() {
  const email = 'blog.outfit.fr@gmail.com';
  
  // Find user
  const userRows = await db.select().from(users).where(eq(users.email, email));
  if (userRows.length === 0) {
    console.log("User not found");
    return;
  }
  const user = userRows[0];
  console.log(`Cleaning user ${user.id} (${user.email})`);

  // Delete posts
  await db.delete(posts).where(eq(posts.userId, user.id));
  console.log("Posts deleted");

  // Delete social accounts
  await db.delete(socialAccounts).where(eq(socialAccounts.userId, user.id));
  console.log("Social accounts deleted");

  // Reset trial and quota
  await db.update(users)
    .set({
      monthlyAiCount: 0,
      plan: 'free',
      trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
    })
    .where(eq(users.id, user.id));
  console.log("Trial and quota reset");

  console.log("Done");
  process.exit(0);
}

cleanUser().catch(console.error);
