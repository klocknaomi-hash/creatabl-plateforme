import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAnalyticsData } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import { subDays, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ReachLineChart,
  PlatformDonutChart,
  ContentVelocityChart,
} from "@/components/dashboard/analytics-charts";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  MessageSquare, 
  Plus,
  BarChart3,
  Sparkles,
  Zap
} from "lucide-react";
import { 
  InstagramIcon, 
  LinkedinIcon, 
  FacebookIcon, 
  TwitterIcon,
  TiktokIcon,
  YoutubeIcon,
  PinterestIcon
} from "@/components/platform-icons";

import { PlatformSelector } from "@/components/dashboard/platform-selector";
import { AnalyticsNavigation } from "@/components/dashboard/analytics-navigation";

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ from?: string; to?: string; platform?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const fromDate = searchParams.from ? new Date(searchParams.from) : subDays(new Date(), 7);
  const toDate = searchParams.to ? new Date(searchParams.to) : new Date();

  const diffDays = differenceInDays(toDate, fromDate);
  const isLimited = user.plan === "free" && diffDays > 7;

  // If limited, we still fetch data but maybe we only fetch the last 7 days or show a prompt
  const effectiveFrom = isLimited ? subDays(new Date(), 7) : fromDate;
  
  const data = await getAnalyticsData(user.id, effectiveFrom, toDate);

  const selectedPlatform = searchParams.platform;
  
  // Filter summary based on platform selection if needed
  let displaySummary = data.summary;
  let filteredTimeSeries = data.timeSeries;
  let filteredPerformanceTable = data.performanceTable;

  if (selectedPlatform && (data.platformStats as any)[selectedPlatform]) {
    const stats = (data.platformStats as any)[selectedPlatform];
    displaySummary = {
      ...data.summary,
      totalPosts: stats.posts,
      totalReach: stats.reach,
      totalImpressions: stats.impressions,
      totalLikes: stats.likes,
      totalComments: stats.comments,
      totalShares: stats.shares,
      avgEngagementRate: Number(stats.impressions) > 0 
        ? (Number(stats.engagement) / Number(stats.impressions)) * 100 
        : 0
    };

    filteredTimeSeries = data.timeSeries.filter(ts => ts.platform === selectedPlatform);
    filteredPerformanceTable = data.performanceTable.filter(post => post.platform === selectedPlatform);
  }

  if (data.connectedPlatforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 text-center">
        <div className="bg-primary/10 p-6 rounded-full">
          <BarChart3 className="size-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Aucun compte connecté</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connectez vos comptes sociaux pour commencer à suivre les performances, l'engagement et la portée sur tous vos canaux.
          </p>
        </div>
        <Link href="/dashboard/accounts">
          <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
            <Plus className="mr-2 size-5" />
            Connecter votre premier compte
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8 border-b border-border/40 pb-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm font-medium">
            Aperçu personnalisé des performances
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <PlatformSelector connectedPlatforms={data.connectedPlatforms} />
          <AnalyticsNavigation />
        </div>
      </div>

      {isLimited && (
        <Alert variant="destructive" className="bg-primary/5 border-primary/20 text-primary-foreground rounded-2xl overflow-hidden">
          <Lock className="h-4 w-4" />
          <AlertTitle className="font-bold">Fonctionnalité Pro</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">Le Plan gratuit est limité aux 7 derniers jours d'Analytics. Upgrade au Plan Pro pour l'historique complet.</span>
            <Link href="/dashboard/billing">
              <Button size="sm" className="ml-4 font-bold rounded-full">Upgrade</Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[28px] border-border/50 shadow-sm overflow-hidden group hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Total des Posts</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{displaySummary.totalPosts}</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
              {selectedPlatform ? `Sur ${selectedPlatform}` : "Sur toutes les plateformes"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-border/50 shadow-sm overflow-hidden group hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Reach total</CardTitle>
            <Users className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{Number(displaySummary.totalReach).toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Utilisateurs uniques atteints</p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/50 shadow-sm overflow-hidden group hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Engagement</CardTitle>
            <MousePointer2 className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{displaySummary.avgEngagementRate.toFixed(2)}%</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Taux moyen par impression</p>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-border/50 shadow-sm overflow-hidden group hover:border-violet-500/20 transition-colors bg-violet-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-violet-500/50">Support IA</CardTitle>
            <Sparkles className="h-3.5 w-3.5 text-violet-500/40 group-hover:text-violet-500 transition-colors fill-violet-500/10" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-violet-600">{(displaySummary as any).aiActions || 0}</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Générations de contenu</p>
          </CardContent>
        </Card>
      </div>



      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Line Chart: Reach over time */}
        <Card className="col-span-4 rounded-[32px] border-border/50 shadow-sm overflow-hidden hover:border-primary/10 transition-colors">
          <CardHeader>
            <CardTitle className="font-bold text-sm">Reach & Impressions</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {selectedPlatform ? `Performance de ${selectedPlatform}` : "Sur toutes les plateformes"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {filteredTimeSeries.length > 0 ? (
              <ReachLineChart data={filteredTimeSeries} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                <BarChart3 className="size-8" />
                <p className="text-xs font-bold uppercase tracking-widest">Pas de données pour cette période</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut Chart: Platform Distribution */}
        <Card className="col-span-3 rounded-[32px] border-border/50 shadow-sm overflow-hidden hover:border-primary/10 transition-colors">
          <CardHeader>
            <CardTitle className="font-bold text-sm">Distribution par plateforme</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Posts publiés par Plateforme</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {data.platformDist.length > 0 ? (
              <PlatformDonutChart data={data.platformDist} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                <BarChart3 className="size-8" />
                <p className="text-xs font-bold uppercase tracking-widest">Pas de données de plateforme</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Bar Chart: Posts per day */}
        <Card className="col-span-3 rounded-[32px] border-border/50 shadow-sm overflow-hidden hover:border-primary/10 transition-colors">
          <CardHeader>
            <CardTitle className="font-bold text-sm">Vitesse du contenu</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Nombre de Posts publiés par jour</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            {data.postsPerDay.length > 0 ? (
              <ContentVelocityChart data={data.postsPerDay} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                <BarChart3 className="size-8" />
                <p className="text-xs font-bold uppercase tracking-widest">Aucune activité trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Performance Table */}
        <Card className="col-span-4 rounded-[32px] border-border/50 shadow-sm overflow-hidden hover:border-primary/10 transition-colors">
          <CardHeader>
            <CardTitle className="font-black text-lg">Performance des Posts</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Détail de vos Posts récents</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Plateforme</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Légende</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Likes</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Reach</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">ER%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformanceTable.length > 0 ? filteredPerformanceTable.map((post: {
                  id: string;
                  platform: string;
                  content: string;
                  publishedAt: Date | null;
                  likes: number;
                  comments: number;
                  shares: number;
                  reach: number;
                  impressions: number;
                }) => {
                  const er = Number(post.impressions) > 0 
                    ? ((Number(post.likes) + Number(post.comments) + Number(post.shares)) / Number(post.impressions)) * 100 
                    : 0;
                  return (
                    <TableRow key={`${post.id}-${post.platform}`} className="border-border/40">
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] font-black px-2 py-0.5 rounded-lg border-primary/20 bg-primary/5 text-primary">
                          {post.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate font-bold text-xs">
                        {post.content}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold">{post.likes}</TableCell>
                      <TableCell className="text-right text-xs font-bold">{Number(post.reach).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-[10px] font-bold text-emerald-600">
                        {er.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aucun Post ne correspond aux critères</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

