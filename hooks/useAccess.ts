'use client'
import { useUser } from '@clerk/nextjs'
import { getPlanAccess, PlanAccess } from '@/lib/plans'

export function useAccess(): PlanAccess {
  const { user } = useUser()

  // Get plan from user's public metadata
  // This is set by the Stripe webhook after checkout
  const plan = (user?.publicMetadata?.plan as string)
    || 'starter'

  return getPlanAccess(plan)
}

/**
 * CLIENT COMPONENT EXAMPLE:
 * 
 * const access = useAccess()
 * 
 * return (
 *   <>
 *     {access.aiAdvanced && <ReformulateButton />}
 *     {access.analyticsAdvanced && <AdvancedAnalytics />}
 *     {access.multiAccounts && <AccountSwitcher />}
 *   </>
 * )
 */
