import { db } from './db'
import { users, aiLogs } from './db/schema'
import { eq, sql } from 'drizzle-orm'
import { checkPlanLimit } from './plan-limits'

export async function checkAndIncrementUsage(clerkId: string): Promise<boolean> {
  const limitCheck = await checkPlanLimit(clerkId, 'ai')
  if (!limitCheck.allowed) {
    return false
  }

  // Increment monthlyAiCount and log
  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ monthlyAiCount: sql`${users.monthlyAiCount} + 1` })
      .where(eq(users.clerkId, clerkId))

    await tx.insert(aiLogs).values({
      userId: clerkId,
      action: 'generate',
      provider: 'gemini',
      createdAt: new Date(),
    })
  })

  return true
}
