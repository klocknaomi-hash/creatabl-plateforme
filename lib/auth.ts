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
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return null;
    }

    const email = (sessionClaims as any)?.email || '';
    const name = (sessionClaims as any)?.full_name || '';

    // Bug 2 Fix: Ensure user record exists (Upsert)
    // We try to insert, and if it already exists, we just fetch it.
    // This handles the race condition where multiple components might call this simultaneously.
    try {
      await db.insert(users).values({
        clerkId: userId,
        email: email,
        name: name,
        plan: 'starter',
        selectedPlan: 'starter',
      }).onConflictDoNothing();
    } catch (e) {
      // Ignore conflict errors
    }

    const userResult = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    let user = userResult[0];

    if (!user) return null;

    // Ensure user settings exist
    try {
      await db.insert(userSettings).values({
        userId: user.id,
      }).onConflictDoNothing();
    } catch (e) {}

    return user;
  } catch (error) {
    console.error("[auth] Error in getCurrentUser:", error);
    return null;
  }
}

