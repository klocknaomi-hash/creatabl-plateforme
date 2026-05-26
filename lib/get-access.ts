import { auth, clerkClient } from '@clerk/nextjs/server'
import { getPlanAccess, PlanAccess } from '@/lib/plans'

export async function getAccess(): Promise<PlanAccess> {
  const { userId } = await auth()
  if (!userId) return getPlanAccess('starter')

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  
  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const isTestOrNaomi = email === 'klock.naomi@gmail.com' || email.endsWith('-test@creatabl-ia.com')
  
  const plan = isTestOrNaomi ? 'business' : ((user.publicMetadata?.plan as string) || 'starter')

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
