import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { DashboardProviders } from "@/components/dashboard/providers";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ErrorBoundary } from "@/components/error-boundary";
import { getTrialStatus } from "@/lib/trial";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { PaywallBanner } from "@/components/dashboard/PaywallBanner"
import { PaywallProvider } from "@/lib/paywall-context"
import { isNaomiOrTest } from "@/lib/plans"
import { CancellationBanner } from '@/components/dashboard/CancellationBanner';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { userId } = await auth()
    if (!userId) redirect('https://app.creatabl-ia.com/sign-in')
    
    const clerkUser = await currentUser()
    
    // Fix 5: Upsert user in DB — never crash if user doesn't exist
    let dbUser;
    try {
      const [newUser] = await db.insert(users).values({
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
        name: clerkUser?.fullName ?? '',
        plan: 'free',
        selectedPlan: 'free',
      }).onConflictDoNothing().returning()
      
      dbUser = newUser;
      
      // If it already existed, fetch it
      if (!dbUser) {
        dbUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.clerkId, userId)
        });
      }

      // Sync Clerk trial info to DB if missing
      const clerkTrialEndsAt = clerkUser?.publicMetadata?.trialEndsAt as string | undefined;
      const clerkTrialStartedAt = clerkUser?.publicMetadata?.trialStartedAt as string | undefined;
      const clerkSelectedPlan = clerkUser?.publicMetadata?.selectedPlan as string | undefined;
      const clerkSelectedBilling = (clerkUser?.publicMetadata?.selectedBilling || clerkUser?.publicMetadata?.billing) as string | undefined;

      if (dbUser && clerkTrialEndsAt && (!dbUser.trialEndsAt || !dbUser.trialStartedAt)) {
        try {
          await db.update(users).set({
            trialStartedAt: clerkTrialStartedAt ? new Date(clerkTrialStartedAt) : new Date(),
            trialEndsAt: new Date(clerkTrialEndsAt),
            selectedPlan: clerkSelectedPlan || dbUser.selectedPlan || 'starter',
            billingCycle: clerkSelectedBilling || dbUser.billingCycle || 'monthly',
          }).where(eq(users.id, dbUser.id));

          // Refetch updated user
          dbUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.clerkId, userId)
          });
        } catch (syncError) {
          console.error('Failed to sync Clerk trial to DB:', syncError);
        }
      }
    } catch (dbError) {
      console.error('DB upsert error:', dbError)
      // Continue anyway — don't crash the layout
    }
    
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
    const isTestOrNaomi = isNaomiOrTest(userEmail) || userEmail.endsWith('@creatabl-ia.com')

    const onboardingStep = clerkUser?.publicMetadata?.onboardingStep
    const showOnboarding = !isTestOrNaomi && (!onboardingStep || onboardingStep !== 'done')
    
    const now = new Date()
    const trialEndsAt = dbUser?.trialEndsAt ? new Date(dbUser.trialEndsAt) : null

    // Check access permissions
    let isAccessAllowed = false
    try {
      const isFreePlan = dbUser?.plan === 'free'
      const trialActive = trialEndsAt && trialEndsAt > now
      const hasSubscription = dbUser?.stripeSubscriptionId != null && 
        (dbUser.subscriptionStatus === 'active' || 
         dbUser.subscriptionStatus === 'trialing' || 
         dbUser.subscriptionStatus === 'canceling')
      
      isAccessAllowed = !!(isTestOrNaomi || isFreePlan || trialActive || hasSubscription)
    } catch (e) {
      isAccessAllowed = true // fail open, don't block
    }

    const shouldRedirectToUpgrade = !isAccessAllowed && !showOnboarding

    // Read the pathname header from middleware
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''

    if (shouldRedirectToUpgrade && pathname !== '/dashboard/upgrade-required') {
      redirect('/dashboard/upgrade-required')
    }

    // Full-screen rendering for the upgrade-required page
    if (pathname === '/dashboard/upgrade-required') {
      return (
        <DashboardProviders>
          <ErrorBoundary>
            <main className="min-h-screen w-full bg-[#05010d] flex items-center justify-center">
              {children}
            </main>
          </ErrorBoundary>
        </DashboardProviders>
      )
    }

    return (
      <DashboardProviders>
        <ErrorBoundary>
          <AppSidebar />
        </ErrorBoundary>
        <SidebarInset>
          <ErrorBoundary>
            <Topbar />
          </ErrorBoundary>
          <CancellationBanner cancelsAt={dbUser?.cancelsAt} />
          <TrialBanner />
          <main className="relative flex flex-1 flex-col p-4 md:p-6 lg:p-8">
            <PaywallProvider isLocked={false} selectedPlan={dbUser?.selectedPlan || null}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </PaywallProvider>
            {/* Show onboarding if not completed */}
            {showOnboarding && <OnboardingModal />}
          </main>
        </SidebarInset>
      </DashboardProviders>
    );
  } catch (error) {
    console.error('Dashboard layout error:', error)
    redirect('https://app.creatabl-ia.com/sign-in')
  }
}
