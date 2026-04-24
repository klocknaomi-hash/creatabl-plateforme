import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Retrieves the current authenticated user from Clerk and matches it with the database record.
 * 
 * @returns The database user object if authenticated and found, otherwise null.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const userResult = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  const user = userResult[0];

  if (!user) {
    return null;
  }

  return user;
}
