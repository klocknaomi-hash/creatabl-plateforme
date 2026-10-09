import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect, unstable_rethrow } from 'next/navigation'
import { db } from '@/lib/db'
import { users, posts } from '@/lib/db/schema'
import { and, count, eq } from 'drizzle-orm'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { DashboardProviders } from "@/components/dashboard/providers";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ErrorBoundary } from "@/components/error-boundary";
import { getTrialStatus } from "@/lib/trial";
import { TrialBanner, type TrialInfo } from "@/components/dashboard/TrialBanner";
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
    if (!userId) redirect('/sign-in')
    
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
      } else if (dbUser && dbUser.trialEndsAt && !clerkTrialEndsAt) {
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              trialStartedAt: dbUser.trialStartedAt ? dbUser.trialStartedAt.toISOString() : new Date().toISOString(),
              trialEndsAt: dbUser.trialEndsAt.toISOString(),
              selectedPlan: dbUser.selectedPlan || 'starter',
              billing: dbUser.billingCycle || 'monthly',
              onboardingStep: dbUser.onboardingCompleted ? 'done' : undefined,
            }
          });
          console.log(`Synced DB trial to Clerk metadata for user ${userId}`);
        } catch (clerkSyncError) {
          console.error('Failed to sync DB trial to Clerk:', clerkSyncError);
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

    // Bannière d'essai : uniquement pendant un essai réel (dates en base), jamais pour
    // le plan Free, un abonné ou un compte de test.
    let trialInfo: TrialInfo | null = null
    try {
      const subscribed = !!dbUser?.isSubscribed || dbUser?.subscriptionStatus === 'active'
      const onPaidTrial = (dbUser?.selectedPlan || dbUser?.plan || 'free') !== 'free'
      if (!isTestOrNaomi && !showOnboarding && !subscribed && onPaidTrial && trialEndsAt && trialEndsAt > now && dbUser) {
        const scheduled = await db
          .select({ value: count() })
          .from(posts)
          .where(and(eq(posts.userId, dbUser.id), eq(posts.status, 'scheduled')))
        trialInfo = {
          startedAt: dbUser.trialStartedAt ? new Date(dbUser.trialStartedAt).toISOString() : null,
          endsAt: trialEndsAt.toISOString(),
          trialPlan: (clerkUser?.publicMetadata?.trialPlan as string) || 'business',
          selectedPlan: dbUser.selectedPlan || null,
          scheduledCount: Number(scheduled[0]?.value ?? 0),
        }
      }
    } catch (e) {
      console.error('Trial banner data error:', e)
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
            <main className="min-h-screen w-full bg-[#F8F7FC] flex items-center justify-center">
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
          <TrialBanner trial={trialInfo} />
          <main className="relative flex flex-1 flex-col bg-[#F8F7FC] p-4 md:p-6 lg:p-8 dark:bg-transparent">
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
    // Les redirections de Next (connexion, essai terminé) passent par une exception :
    // elles doivent sortir du try. Une vraie erreur ne renvoie plus vers /sign-in,
    // qui renvoyait aussitôt ici : la page clignotait entre les deux sans fin.
    unstable_rethrow(error)
    console.error('Dashboard layout error:', error)
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F7FC] p-6">
        <div className="max-w-md rounded-2xl border border-[#E8E6F0] bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-[#14121F]">Le tableau de bord n&apos;a pas pu se charger</h1>
          <p className="mt-2 text-sm text-[#4B4B63]">Une erreur temporaire est survenue. Réessayez dans un instant.</p>
          <a href="/dashboard" className="cr-btn cr-btn--primary mt-6 inline-flex">Réessayer</a>
        </div>
      </main>
    )
  }
}
