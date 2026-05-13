import Link from "next/link";
import { Users, TrendingUp, Calendar as CalendarIcon, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDashboardStats, getCachedUserSettings, getCachedAccounts } from "@/lib/dashboard-data";
import { getTranslation } from "@/lib/i18n";

import { auth } from "@clerk/nextjs/server";

interface StatsRowProps {
  summary: any;
  upcomingCount: number;
  hasAccounts: boolean;
  hasPosts: boolean;
  t: any;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center 
    h-64 text-center border border-dashed border-gray-200 
    rounded-2xl p-8 col-span-full">
    <p className="font-medium text-gray-500 mb-1">
      Connecte tes réseaux sociaux
    </p>
    <p className="text-sm text-gray-400 mb-4">
      Tes données apparaîtront ici une fois connecté.
    </p>
    <Link href="/dashboard/settings/connections" className="bg-[#534AB7] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#453da3] transition-colors">
      Connecter mes réseaux
    </Link>
  </div>
);

export async function StatsRow() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  try {
    const [stats, settings, accounts] = await Promise.all([
      getDashboardStats(clerkId),
      getCachedUserSettings(clerkId),
      getCachedAccounts(clerkId),
    ]);

    const t = getTranslation(settings?.language || "fr");
    const hasAccounts = (accounts || []).length > 0;
    const hasPosts = Number(stats.totalPosts || 0) > 0;

    if (!hasAccounts) {
      return <EmptyState />;
    }

    return (
      <StatsRowView 
        summary={stats} 
        upcomingCount={stats.upcomingCount} 
        hasAccounts={hasAccounts} 
        hasPosts={hasPosts} 
        t={t} 
      />
    );
  } catch (error) {
    console.error("StatsRow error:", error);
    return <EmptyState />;
  }
}

export function StatsRowView({ summary, upcomingCount, hasAccounts, hasPosts, t }: StatsRowProps) {
  const statCards = [
    {
      id: "stat-total-reach",
      title: t.totalReach,
      value: hasPosts ? (summary.totalReach?.toLocaleString() || "0") : "0",
      description: "Toutes plateformes",
      icon: Users,
      trend: hasPosts ? "+12%" : "---",
      variant: "violet"
    },
    {
      id: "stat-engagement",
      title: t.engagement,
      value: hasPosts ? `${summary.avgEngagementRate?.toFixed(1) || "0.0"}%` : "0.0%",
      description: "Taux moyen",
      icon: TrendingUp,
      trend: hasPosts ? "+2.4%" : "---",
      variant: "violet"
    },
    {
      id: "stat-scheduled",
      title: t.scheduled,
      value: upcomingCount || "0",
      description: "En pipeline",
      icon: CalendarIcon,
      trend: "À venir",
      variant: "violet"
    },
    {
      id: "stat-drafts",
      title: t.drafts,
      value: summary.totalDrafts || "0",
      description: "Prêt à peaufiner",
      icon: FileText,
      trend: "En cours",
      variant: "violet"
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const href = card.id.includes("scheduled") 
          ? "/dashboard/calendar" 
          : card.id.includes("drafts") 
            ? "/dashboard/posts?status=draft" 
            : "/dashboard/analytics";

        return (
          <Link key={card.id} href={href} className="block group">
            <Card className="relative overflow-hidden border-none bg-background shadow-sm ring-1 ring-border/50 rounded-[2rem] transition-all hover:shadow-xl hover:shadow-violet-600/5 hover:ring-violet-600/30 h-full cursor-pointer">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <card.icon className="size-24 -mr-8 -mt-8 rotate-12" />
              </div>
              
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                    "bg-violet-600/10 text-violet-600"
                  )}>
                    <card.icon className="size-6" />
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-muted/50 border-none">
                    {card.trend}
                  </Badge>
                </div>
                
                {!hasAccounts && !card.id.includes("drafts") && !card.id.includes("scheduled") ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{card.title}</p>
                    <p className="text-sm font-bold text-violet-600 group-hover:underline">Connecter des comptes</p>
                  </div>
                ) : hasAccounts && !hasPosts && !card.id.includes("drafts") && !card.id.includes("scheduled") ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{card.title}</p>
                    <p className="text-sm font-bold text-muted-foreground/60 italic">Aucune donnée disponible</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{card.title}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-black tracking-tight">{card.value}</p>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground/60">{card.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}

