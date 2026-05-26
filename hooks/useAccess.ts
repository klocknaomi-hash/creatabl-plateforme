'use client'
import { useUser } from '@clerk/nextjs'
import { getPlanAccess, PlanAccess, isNaomiOrTest } from '@/lib/plans'

export function useAccess(): PlanAccess {
  const { user } = useUser()

  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  const isTest = isNaomiOrTest(email)

  // Get plan from user's public metadata
  // This is set by the Stripe webhook after checkout
  const plan = isTest ? 'business' : ((user?.publicMetadata?.plan as string) || 'starter')

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
