import { auth, clerkClient } from '@clerk/nextjs/server'
import { getPlanAccess, PlanAccess, isNaomiOrTest } from '@/lib/plans'

export async function getAccess(): Promise<PlanAccess> {
  const { userId } = await auth()
  if (!userId) return getPlanAccess('starter')
  return getAccessForClerkId(userId)
}

// Même calcul sans session (tâches planifiées) : plan lu dans les métadonnées Clerk.
export async function getAccessForClerkId(userId: string): Promise<PlanAccess> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  
  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const isTest = isNaomiOrTest(email)
  
  const plan = isTest || (
    user.publicMetadata?.trialEndsAt && 
    new Date(user.publicMetadata.trialEndsAt as string) > new Date()
  )
    ? 'business'
    : ((user.publicMetadata?.plan as string) || 'starter')

  return getPlanAccess(plan)
}

/**
 * API ROUTE EXAMPLE:
 * 
 * const access = await getAccess()
 * if (!access.aiAdvanced) {
 *   return Response.json(
 *     { error: 'Upgrade to Pro' },
 *     { status: 403 }
 *   )
 * }
 */
