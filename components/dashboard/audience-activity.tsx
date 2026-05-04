import { AudienceActivityChart } from "./audience-activity-chart";
import { getEngagementData, getCachedAccounts, getDashboardStats } from "@/lib/dashboard-data";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

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
    <Card className="rounded-[2.5rem] border-none bg-background shadow-xl shadow-muted/20 ring-1 ring-border/50 overflow-hidden">
      <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="size-5 text-violet-600" />
            Activité de l'audience
          </CardTitle>
          <CardDescription className="text-sm font-medium">Performance quotidienne de l'engagement et de la croissance</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full text-xs border-violet-600/20 bg-violet-600/5 text-violet-600 font-bold px-4 py-1">
            7 derniers jours
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-10 pb-10">
        <AudienceActivityChart 
          engagementData={engagementData} 
          hasAccounts={hasAccounts} 
          hasPosts={hasPosts} 
        />
      </CardContent>
    </Card>
  );
}
