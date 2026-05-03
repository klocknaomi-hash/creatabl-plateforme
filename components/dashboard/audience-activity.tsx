import { AudienceActivityChart } from "./audience-activity-chart";
import { getEngagementData, getCachedAccounts, getDashboardStats } from "@/lib/dashboard-data";

import { auth } from "@clerk/nextjs/server";

export async function AudienceActivity() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const [engagementData, accounts, stats] = await Promise.all([
    getEngagementData(clerkId),
    getCachedAccounts(clerkId),
    getDashboardStats(clerkId),
  ]);

  const hasAccounts = (accounts || []).length > 0;
  const hasPosts = Number(stats.totalPosts || 0) > 0;

  return (
    <AudienceActivityChart 
      engagementData={engagementData} 
      hasAccounts={hasAccounts} 
      hasPosts={hasPosts} 
    />
  );
}
