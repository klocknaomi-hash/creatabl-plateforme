import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { DashboardIntro } from "@/components/dashboard/dashboard-intro";
import { StatsRow } from "@/components/dashboard/stats-row";
import { ActiveChannels } from "@/components/dashboard/active-channels";
import { AudienceActivity } from "@/components/dashboard/audience-activity";
import { UpcomingSchedule } from "@/components/dashboard/upcoming-schedule";
import { RecentDrafts } from "@/components/dashboard/recent-drafts";
import { TopContent } from "@/components/dashboard/top-content";


export default async function DashboardPage() {
  // Mise en page DashboardPage du design system : accueil, indicateurs,
  // « À venir » à gauche, comptes et brouillons à droite, puis activité et meilleurs posts.
  return (
    <div className="mx-auto grid w-full max-w-[1180px] content-start gap-6 pb-12">
      <Suspense fallback={<Skeleton className="h-16 w-72" />}>
        <DashboardIntro />
      </Suspense>

      <div className="ap-grid">
        <Suspense fallback={<Skeleton className="h-[320px] rounded-[12px]" />}>
          <UpcomingSchedule />
        </Suspense>
        <div className="grid gap-6">
          <Suspense fallback={<Skeleton className="h-[180px] rounded-[12px]" />}>
            <ActiveChannels />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[220px] rounded-[12px]" />}>
            <RecentDrafts />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<StatsRowSkeleton />}>
        <StatsRow />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[420px] w-full rounded-[12px]" />}>
        <AudienceActivity />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-[12px]" />}>
        <TopContent />
      </Suspense>
    </div>
  );
}

function StatsRowSkeleton() {
  return (
    <div className="ap-stats">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[136px] rounded-[12px]" />
      ))}
    </div>
  );
}

