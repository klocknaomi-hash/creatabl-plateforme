import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Retrieves the current authenticated user from Clerk and matches it with the database record.
 * 
 * @returns The database user object if authenticated and found, otherwise null.
 */
export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return null;
  }

  const userResult = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  let user = userResult[0];

  // Auto-sync user if they exist in Clerk but not in our DB (common in dev/no webhooks)
  if (!user) {
    const email = (sessionClaims as any)?.email || '';
    const name = (sessionClaims as any)?.full_name || '';
    
    const [newUser] = await db.insert(users).values({
      clerkId: userId,
      email: email,
      name: name,
      plan: 'free',
    }).returning();
    
    user = newUser;
  }

  // Ensure user settings exist
  const settingsResult = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
  if (settingsResult.length === 0) {
    await db.insert(userSettings).values({
      userId: user.id,
    });
  }

  return user;
}

