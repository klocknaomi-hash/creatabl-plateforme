import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const name = clerkUser?.fullName ?? null

  await db.insert(users)
    .values({
      clerkId: userId,
      email,
      name,
      plan: 'free',
      selectedPlan: 'free',
      subscriptionStatus: 'active',
      trialEndsAt: null,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        plan: 'free',
        selectedPlan: 'free',
        subscriptionStatus: 'active',
        trialEndsAt: null,
      },
    })

  return Response.json({ success: true })
}
