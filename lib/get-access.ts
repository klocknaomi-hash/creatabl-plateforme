import { auth, clerkClient } from '@clerk/nextjs/server'
import { getPlanAccess, PlanAccess } from '@/lib/plans'

export async function getAccess(): Promise<PlanAccess> {
  const { userId } = await auth()
  if (!userId) return getPlanAccess('starter')

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const plan = (user.publicMetadata?.plan as string)
    || 'starter'

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
