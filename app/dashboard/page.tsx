"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  Zap,
  BarChart3,
  Layers
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter,
  YoutubeIcon,
  TiktokIcon
} from "@/components/platform-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string, bg: string, border: string, glow: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  youtube: { color: "text-[#FF0000]", icon: YoutubeIcon, label: "YouTube", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  tiktok: { color: "text-foreground", icon: TiktokIcon, label: "TikTok", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
};

// ── Dashboard Component ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-[450px] rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-[210px] rounded-2xl" />
            <Skeleton className="h-[210px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const upcomingPosts = data?.upcomingPosts || [];
  const recentDrafts = data?.recentDrafts || [];
  const topPosts = data?.topPosts || [];
  const platformStats = data?.platformStats || {};
  const accounts = data?.accounts || [];

  const statCards = [
    {
      id: "stat-total-reach",
      title: "Total Reach",
      value: summary.totalReach?.toLocaleString() || "0",
      description: "Across platforms",
      icon: Users,
      trend: "+12%",
      variant: "violet"
    },
    {
      id: "stat-engagement",
      title: "Engagement",
      value: `${summary.avgEngagementRate?.toFixed(1) || "0.0"}%`,
      description: "Average rate",
      icon: TrendingUp,
      trend: "+2.4%",
      variant: "violet"
    },
    {
      id: "stat-scheduled",
      title: "Scheduled",
      value: upcomingPosts.length || "0",
      description: "In pipeline",
      icon: CalendarIcon,
      trend: "Upcoming",
      variant: "violet"
    },
    {
      id: "stat-drafts",
      title: "Active Drafts",
      value: summary.totalDrafts || "0",
      description: "Ready to polish",
      icon: FileText,
      trend: "In progress",
      variant: "violet"
    },
  ];

  const engagementData = (data?.timeSeries || []).reduce((acc: any[], curr: any) => {
    const dateStr = format(new Date(curr.date), "MMM d");
    let existing = acc.find(a => a.date === dateStr);
    
    if (!existing) {
      existing = { date: dateStr, likes: 0, comments: 0, shares: 0, impressions: 0 };
      acc.push(existing);
    }
    
    existing.likes += Number(curr.likes || 0);
    existing.comments += Number(curr.comments || 0);
    existing.shares += Number(curr.shares || 0);
    existing.impressions += Number(curr.impressions || 0);
    
    return acc;
  }, []).map((day: any) => ({
    date: day.date,
    engagement: day.impressions > 0 
      ? parseFloat(((day.likes + day.comments + day.shares) / day.impressions * 100).toFixed(1))
      : 0
  })).slice(-7);

  return (
    <div className="space-y-10 pb-10 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My content dashboard
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Track growth and optimise your posting strategy in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Main header actions if any, but removing the redundant Create New Post button */}
        </div>
      </header>

      {/* ── Stats Row ── */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.id} className="border-none bg-muted/30 rounded-2xl transition-all hover:bg-muted/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  "bg-violet-600/10 text-violet-600"
                )}>
                  <card.icon className="size-5" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded-md">
                  {card.trend}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{card.title}</p>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <p className="text-[10px] font-medium text-muted-foreground/60">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Connected Accounts (Repositioned) ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Active Channels</h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        
        {accounts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accounts.map((acc: any) => {
              const brand = PLATFORM_BRANDING[acc.platform.toLowerCase()];
              const Icon = brand?.icon || ExternalLink;
              const stats = platformStats[acc.platform] || {};

              return (
                <Card key={acc.id} className="rounded-2xl border-none shadow-none ring-1 ring-border/50 bg-background hover:ring-violet-600/30 transition-all">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("size-9 rounded-lg flex items-center justify-center border border-border/40", brand?.bg, brand?.color)}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-tight">{brand?.label}</p>
                          <p className="text-[10px] font-medium text-muted-foreground/60">@{acc.username}</p>
                        </div>
                      </div>
                      <Badge className="h-5 rounded-full text-[8px] bg-violet-600/10 text-violet-600 border-none font-bold uppercase tracking-tight">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Reach</p>
                        <p className="text-base font-bold">{(stats.reach || 0).toLocaleString()}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Posts</p>
                        <p className="text-base font-bold">{stats.posts || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="px-1 text-muted-foreground text-sm font-medium">
            No active channels. Link your accounts in settings to see stats here.
          </div>
        )}
      </section>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Analytics & Performance */}
        <div className="space-y-10">
          <Card className="rounded-2xl border-none bg-background shadow-sm ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  Audience activity
                </CardTitle>
                <CardDescription className="text-xs font-medium">Growth performance over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-violet-600/20 bg-violet-600/5 text-violet-600 font-bold px-2">Last 7 Days</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-6">
              {engagementData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(124, 58, 237)" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="rgb(124, 58, 237)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} 
                        tickLine={false} 
                        axisLine={false}
                        dy={8}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: "12px", 
                          border: "1px solid hsl(var(--border))",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                          fontSize: "11px",
                          fontWeight: "700",
                          backgroundColor: "hsl(var(--popover))",
                          padding: "8px 12px"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="rgb(124, 58, 237)" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorViolet)" 
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: "rgb(124, 58, 237)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-3 opacity-40">
                  <BarChart3 className="size-8 text-muted-foreground" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Collecting data...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Posts Section */}
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                Top performing posts
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-violet-600" onClick={() => window.location.href = "/dashboard/analytics"}>
                View all
              </Button>
            </div>
            
            {topPosts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {topPosts.map((post: any) => {
                  const brand = PLATFORM_BRANDING[post.platform.toLowerCase()];
                  const Icon = brand?.icon || ExternalLink;
                  return (
                    <Card key={post.id} className="rounded-xl border-none bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden">
                      <CardContent className="p-5 flex gap-4">
                        <div className={cn("size-10 shrink-0 rounded-lg flex items-center justify-center bg-background border border-border/40", brand?.color)}>
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-xs font-bold line-clamp-1 text-foreground/90">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {post.impressions?.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="size-3 text-violet-600" />
                              {((post.likes + post.comments + post.shares) / (post.impressions || 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="self-start opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="size-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 p-10 text-center bg-muted/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">No post data yet</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Schedule & Drafts */}
        <div className="space-y-8">
          {/* Upcoming Schedule */}
          <Card className="rounded-2xl border-none bg-background shadow-sm ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <Clock className="size-4 text-violet-600" />
                Scheduled for today
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingPosts.length > 0 ? (
                <div className="divide-y divide-border/20">
                  {upcomingPosts.map((post: any) => {
                    const brand = PLATFORM_BRANDING[post.platforms?.[0]?.toLowerCase()];
                    const Icon = brand?.icon || ExternalLink;
                    return (
                      <div key={post.id} className="p-4 hover:bg-muted/20 transition-colors cursor-pointer group flex items-center justify-between" onClick={() => window.location.href = `/dashboard/posts/${post.id}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("size-8 rounded-lg flex items-center justify-center bg-background border border-border/40 shrink-0", brand?.color)}>
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold line-clamp-1 group-hover:text-violet-600 transition-colors">{post.content}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              {format(new Date(post.scheduledAt), "h:mm a")} • {brand?.label}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="size-3.5 text-muted-foreground/30 group-hover:text-violet-600 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Nothing scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Drafts */}
          <Card className="rounded-2xl border-none bg-background shadow-sm ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <FileText className="size-4 text-violet-600" />
                Quick drafts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentDrafts.length > 0 ? (
                <div className="divide-y divide-border/20">
                  {recentDrafts.map((post: any) => (
                    <div key={post.id} className="p-4 hover:bg-muted/20 transition-colors cursor-pointer group" onClick={() => window.location.href = `/dashboard/compose?id=${post.id}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                          {format(new Date(post.createdAt), "MMM d")}
                        </span>
                        <div className="flex -space-x-1">
                          {post.platforms?.map((p: string) => {
                            const BrandIcon = PLATFORM_BRANDING[p.toLowerCase()]?.icon || ExternalLink;
                            return (
                              <div key={p} className="size-4 rounded-full bg-background border border-border/40 flex items-center justify-center p-0.5">
                                <BrandIcon className={cn("size-full", PLATFORM_BRANDING[p.toLowerCase()]?.color)} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-xs font-bold line-clamp-1 text-foreground/80 group-hover:text-violet-600 transition-colors">{post.content || "Untitled draft..."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">No drafts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
