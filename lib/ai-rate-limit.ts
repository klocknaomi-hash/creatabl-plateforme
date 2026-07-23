import { db, dbTransactional } from '@/lib/db'
import { aiUsage, users, aiLogs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const DAILY_LIMITS = {
  starter: 30,
  pro: 120,
  business: 300,
}

export async function checkAiRateLimit(
  userId: string,
  plan: 'starter' | 'pro' | 'business'
): Promise<{
  allowed: boolean
  retryAt?: Date
  message?: string
  remaining?: number
}> {
  const now = new Date()
  const dailyLimit = DAILY_LIMITS[plan] || DAILY_LIMITS.starter

  // Get or create usage record
  let usage = await db.query.aiUsage.findFirst({
    where: eq(aiUsage.userId, userId),
  })

  if (!usage) {
    await db.insert(aiUsage).values({
      userId,
      requestCount: 1,
      windowStart: now,
      lastRequestAt: now,
    })
    return { allowed: true, remaining: dailyLimit - 1 }
  }

  // Check if cooldown is active
  if (usage.cooldownUntil && usage.cooldownUntil > now) {
    const msLeft =
      usage.cooldownUntil.getTime() - now.getTime()
    const hoursLeft = Math.floor(msLeft / 3600000)
    const minutesLeft = Math.floor(
      (msLeft % 3600000) / 60000
    )
    const timeStr = hoursLeft > 0
      ? `${hoursLeft}h${minutesLeft > 0
          ? minutesLeft + 'min' : ''}`
      : `${minutesLeft}min`

    const retryTime =
      usage.cooldownUntil.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    const isToday =
      usage.cooldownUntil.toDateString() ===
      now.toDateString()

    const message = plan === 'starter'
      ? `Tu as utilisé tes ${dailyLimit} générations du jour. Tu pourras relancer ${isToday
          ? 'aujourd\'hui à ' + retryTime
          : 'demain à ' + retryTime}.`
      : `Tu as beaucoup sollicité l'IA 🔥 Tu pourras relancer dans ${timeStr} (à ${retryTime}).`

    return {
      allowed: false,
      retryAt: usage.cooldownUntil,
      message,
      remaining: 0,
    }
  }

  // Check if 24h window has expired — reset
  const windowExpiry = new Date(
    usage.windowStart.getTime() + 24 * 3600000
  )

  if (now > windowExpiry) {
    await db.update(aiUsage)
      .set({
        requestCount: 1,
        windowStart: now,
        cooldownUntil: null,
        lastRequestAt: now,
      })
      .where(eq(aiUsage.userId, userId))
    return {
      allowed: true,
      remaining: dailyLimit - 1,
    }
  }

  // Check if daily limit exceeded
  if (usage.requestCount >= dailyLimit) {
    const cooldownUntil = windowExpiry

    await db.update(aiUsage)
      .set({ cooldownUntil, lastRequestAt: now })
      .where(eq(aiUsage.userId, userId))

    const retryTime = cooldownUntil.toLocaleTimeString(
      'fr-FR',
      { hour: '2-digit', minute: '2-digit' }
    )
    const isToday =
      cooldownUntil.toDateString() === now.toDateString()

    const message = plan === 'starter'
      ? `Tu as utilisé tes ${dailyLimit} générations du jour. Tu pourras relancer ${isToday
          ? 'aujourd\'hui à ' + retryTime
          : 'demain à ' + retryTime}.`
      : `Tu as beaucoup sollicité l'IA aujourd'hui 🔥 Tu pourras relancer demain à ${retryTime}.`

    return {
      allowed: false,
      retryAt: cooldownUntil,
      message,
      remaining: 0,
    }
  }

  // Increment counter
  await db.update(aiUsage)
    .set({
      requestCount: usage.requestCount + 1,
      lastRequestAt: now,
    })
    .where(eq(aiUsage.userId, userId))

  return {
    allowed: true,
    remaining: dailyLimit - usage.requestCount - 1,
  }
}

export async function checkAndIncrementUsage(clerkId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })
  const plan = (user?.plan || 'starter') as 'starter' | 'pro' | 'business'
  
  const rateLimit = await checkAiRateLimit(clerkId, plan)
  if (!rateLimit.allowed) {
    return false
  }

  // Increment monthlyAiCount and log for analytics/billing
  await dbTransactional.transaction(async (tx) => {
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
