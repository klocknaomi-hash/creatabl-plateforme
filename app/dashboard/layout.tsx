import { DashboardProviders } from "@/components/dashboard/providers";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTrialStatus } from "@/lib/trial";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { PaywallOverlay } from "@/components/PaywallOverlay";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  const userData = await db.query.users.findFirst({
    where: eq(users.clerkId, userId as string),
  });

  const trialStatus = userData ? getTrialStatus({
    trialStartedAt: userData.trialStartedAt,
    trialEndsAt: userData.trialEndsAt,
    isSubscribed: userData.isSubscribed ?? false,
  }) : { status: 'no_trial', daysLeft: null };

  return (
    <DashboardProviders>
      <AppSidebar />
      <SidebarInset>
        {trialStatus.status === 'trial' && (
          <TrialBanner daysLeft={trialStatus.daysLeft} />
        )}
        <Topbar />
        <main className="relative flex flex-1 flex-col p-4 md:p-6 lg:p-8">
          {children}
          {trialStatus.status === 'expired' && (
            <PaywallOverlay plan={userData?.selectedPlan || 'starter'} />
          )}
        </main>
      </SidebarInset>
    </DashboardProviders>
  );
}
