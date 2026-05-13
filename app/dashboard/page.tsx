import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { getCachedUserSettings } from "@/lib/dashboard-data";
import { getTranslation } from "@/lib/i18n";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ActiveChannels } from "@/components/dashboard/active-channels";
import { AudienceActivity } from "@/components/dashboard/audience-activity";
import { UpcomingSchedule } from "@/components/dashboard/upcoming-schedule";
import { RecentDrafts } from "@/components/dashboard/recent-drafts";
import { TopContent } from "@/components/dashboard/top-content";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";


export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Check for accounts to show empty state if needed
  let accounts = [];
  try {
    accounts = await getCachedAccounts(clerkId) || [];
  } catch (error) {
    console.error("Error fetching accounts:", error);
  }

  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-12 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <Suspense fallback={<Skeleton className="h-12 w-64" />}>
        <SafeDashboardHeader />
      </Suspense>

      {!hasAccounts ? (
        <div className="flex flex-col items-center justify-center 
          h-64 text-center text-gray-400 border border-dashed 
          border-gray-200 rounded-2xl mx-1">
          <p className="text-lg font-medium text-gray-500 mb-2">
            Ton dashboard est prêt
          </p>
          <p className="text-sm">
            Connecte tes réseaux sociaux pour voir tes données ici.
          </p>
          <a href="/dashboard/settings/connections" 
            className="mt-4 bg-[#534AB7] text-white px-6 py-2 
            rounded-xl text-sm font-bold hover:bg-[#453da3]">
            Connecter mes réseaux
          </a>
        </div>
      ) : (
        <div className="space-y-12">
          {/* ── Stats Row ── */}
          <Suspense fallback={<StatsRowSkeleton />}>
            <SafeStatsRow />
          </Suspense>

          {/* ── Active Channels ── */}
          <Suspense fallback={<Skeleton className="h-16 w-full rounded-full" />}>
            <SafeActiveChannels />
          </Suspense>

          {/* ── Main Dashboard Grid ── */}
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            {/* Left Column: Analytics */}
            <div className="space-y-12">
              <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-[2.5rem]" />}>
                <SafeAudienceActivity />
              </Suspense>
            </div>

            {/* Right Column: Schedule & Drafts */}
            <div className="space-y-10">
              <OnboardingChecklist />
              <Suspense fallback={<Skeleton className="h-[400px] rounded-[2.5rem]" />}>
                <SafeUpcomingSchedule />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-[300px] rounded-[2rem]" />}>
                <SafeRecentDrafts />
              </Suspense>
            </div>
          </div>

          {/* ── Top Content ── */}
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2.5rem]" />}>
            <SafeTopContent />
          </Suspense>
        </>
      )}
    </div>
  );
}

// ── Safe Wrapper Components ──

async function SafeStatsRow() {
  try {
    return await StatsRow();
  } catch (e) {
    console.error("StatsRow crashed:", e);
    return null;
  }
}

async function SafeActiveChannels() {
  try {
    return await ActiveChannels();
  } catch (e) {
    console.error("ActiveChannels crashed:", e);
    return null;
  }
}

async function SafeAudienceActivity() {
  try {
    return await AudienceActivity();
  } catch (e) {
    console.error("AudienceActivity crashed:", e);
    return null;
  }
}

async function SafeUpcomingSchedule() {
  try {
    return await UpcomingSchedule();
  } catch (e) {
    console.error("UpcomingSchedule crashed:", e);
    return null;
  }
}

async function SafeRecentDrafts() {
  try {
    return await RecentDrafts();
  } catch (e) {
    console.error("RecentDrafts crashed:", e);
    return null;
  }
}

async function SafeTopContent() {
  try {
    return await TopContent();
  } catch (e) {
    console.error("TopContent crashed:", e);
    return null;
  }
}

async function SafeDashboardHeader() {
  try {
    return await DashboardHeader();
  } catch (e) {
    console.error("DashboardHeader crashed:", e);
    return null;
  }
}

async function DashboardHeader() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const settings = await getCachedUserSettings(clerkId);
  const t = getTranslation(settings?.language || "fr");

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t.myContentDashboard}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.trackGrowth}
        </p>
      </div>
    </header>
  );
}

function StatsRowSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-48 rounded-[2rem]" />
      ))}
    </div>
  );
}

