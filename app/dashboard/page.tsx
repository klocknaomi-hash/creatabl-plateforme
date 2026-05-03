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


export default async function DashboardPage() {
  return (
    <div className="space-y-12 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <Suspense fallback={<Skeleton className="h-12 w-64" />}>
        <DashboardHeader />
      </Suspense>

      {/* ── Stats Row ── */}
      <Suspense fallback={<StatsRowSkeleton />}>
        <StatsRow />
      </Suspense>

      {/* ── Active Channels ── */}
      <Suspense fallback={<Skeleton className="h-16 w-full rounded-full" />}>
        <ActiveChannels />
      </Suspense>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Analytics */}
        <div className="space-y-12">
          <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-[2.5rem]" />}>
            <AudienceActivity />
          </Suspense>
        </div>

        {/* Right Column: Schedule & Drafts */}
        <div className="space-y-10">
          <Suspense fallback={<Skeleton className="h-[400px] rounded-[2.5rem]" />}>
            <UpcomingSchedule />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[300px] rounded-[2rem]" />}>
            <RecentDrafts />
          </Suspense>
        </div>
      </div>

      {/* ── Top Content ── */}
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2.5rem]" />}>
        <TopContent />
      </Suspense>
    </div>
  );
}

async function DashboardHeader() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const settings = await getCachedUserSettings(clerkId);
  const t = getTranslation(settings?.language || "en");

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

