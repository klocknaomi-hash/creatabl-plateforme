"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Layers,
  Plus,
  Heart,
  MessageCircle,
  Repeat2,
  Eye
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
import { getTranslation } from "@/lib/i18n";

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
      <div className="space-y-12 pb-16 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-12 w-40 rounded-2xl" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[2rem]" />
          ))}
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-12">
            <Skeleton className="h-[500px] rounded-[2.5rem]" />
            <div className="grid gap-6 sm:grid-cols-2">
               <Skeleton className="h-48 rounded-[2rem]" />
               <Skeleton className="h-48 rounded-[2rem]" />
            </div>
          </div>
          <div className="space-y-10">
            <Skeleton className="h-[400px] rounded-[2.5rem]" />
            <Skeleton className="h-[300px] rounded-[2rem]" />
            <Skeleton className="h-[400px] rounded-[2.5rem]" />
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
  const settings = data?.settings || {};
  
  const t = getTranslation(settings.language || "en");
  
  const hasAccounts = accounts.length > 0;
  const hasPosts = Number(summary.totalPosts || 0) > 0;

  const statCards = [
    {
      id: "stat-total-reach",
      title: t.totalReach,
      value: hasPosts ? (summary.totalReach?.toLocaleString() || "0") : "0",
      description: "Across platforms",
      icon: Users,
      trend: hasPosts ? "+12%" : "---",
      variant: "violet"
    },
    {
      id: "stat-engagement",
      title: t.engagement,
      value: hasPosts ? `${summary.avgEngagementRate?.toFixed(1) || "0.0"}%` : "0.0%",
      description: "Average rate",
      icon: TrendingUp,
      trend: hasPosts ? "+2.4%" : "---",
      variant: "violet"
    },
    {
      id: "stat-scheduled",
      title: t.scheduled,
      value: upcomingPosts.length || "0",
      description: "In pipeline",
      icon: CalendarIcon,
      trend: "Upcoming",
      variant: "violet"
    },
    {
      id: "stat-drafts",
      title: t.drafts,
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
    <div className="space-y-12 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
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

      {/* ── Stats Row ── */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const CardWrapper = ({ children }: { children: React.ReactNode }) => (
            <Link 
              href={card.id.includes("scheduled") ? "/dashboard/calendar" : card.id.includes("drafts") ? "/dashboard/posts?status=draft" : "/dashboard/analytics"}
              className="block group"
            >
              {children}
            </Link>
          );

          return (
            <CardWrapper key={card.id}>
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
                      <p className="text-sm font-bold text-violet-600 group-hover:underline">Connect accounts</p>
                    </div>
                  ) : hasAccounts && !hasPosts && !card.id.includes("drafts") && !card.id.includes("scheduled") ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{card.title}</p>
                      <p className="text-sm font-bold text-muted-foreground/60 italic">No data available</p>
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
            </CardWrapper>
          );
        })}
      </section>

      {/* ── Active Channels ── */}
      {accounts.length > 0 && (
        <section className="px-1 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-violet-600/10 flex items-center justify-center">
                <Layers className="size-4 text-violet-600" />
              </div>
              <h2 className="text-sm font-bold tracking-tight">{t.activeChannels || "Active Channels"}</h2>
            </div>
            <Link href="/dashboard/accounts" className="text-xs font-bold text-muted-foreground hover:text-violet-600 transition-colors flex items-center gap-1.5 group">
              {t.manageAccounts || "Manage Accounts"}
              <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {accounts.map((acc: any) => {
              const brand = PLATFORM_BRANDING[acc.platform.toLowerCase()];
              const Icon = brand?.icon || ExternalLink;
              return (
                <Link key={acc.id} href="/dashboard/accounts" className="group">
                  <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-background border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-violet-600/20 group-active:scale-[0.98]">
                    <div className={cn(
                      "size-9 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105", 
                      brand?.bg || "bg-muted/30", 
                      brand?.color || "text-foreground"
                    )}>
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-1">
                      <p className="text-[11px] font-bold truncate leading-tight">@{acc.username}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{brand?.label || acc.platform}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            
            <Link href="/dashboard/accounts" className="group">
              <div className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-muted/5 border border-dashed border-border/60 hover:bg-muted/10 transition-all h-full group-active:scale-[0.98]">
                <div className="size-9 rounded-full bg-background flex items-center justify-center text-muted-foreground/40 shadow-sm group-hover:text-violet-600 transition-colors">
                  <Plus className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground/60 group-hover:text-violet-600 transition-colors whitespace-nowrap">Connect Platform</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Main Dashboard Grid ── */}
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Analytics & Accounts */}
        <div className="space-y-12">
          {/* Audience Activity */}
          <Card className="rounded-[2.5rem] border-none bg-background shadow-xl shadow-muted/20 ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="size-5 text-violet-600" />
                  Audience activity
                </CardTitle>
                <CardDescription className="text-sm font-medium">Daily engagement and growth performance</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-xs border-violet-600/20 bg-violet-600/5 text-violet-600 font-bold px-4 py-1">
                  Last 7 Days
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              {!hasAccounts ? (
                 <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-6">
                  <div className="bg-violet-600/5 p-6 rounded-full">
                    <BarChart3 className="size-10 text-violet-600/40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Unlock deeper insights</p>
                    <Button 
                      variant="outline" 
                      className="rounded-xl border-violet-600/20 text-violet-600 font-bold hover:bg-violet-600/5" 
                      onClick={() => window.location.href = "/dashboard/accounts"}
                    >
                      Connect your social accounts
                    </Button>
                  </div>
                </div>
              ) : !hasPosts ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-6">
                  <div className="bg-violet-600/5 p-6 rounded-full">
                    <TrendingUp className="size-10 text-violet-600/40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Waiting for data</p>
                    <p className="text-xs text-muted-foreground/50 max-w-[250px]">Once you start posting, your audience activity will appear here in real-time.</p>
                  </div>
                </div>
              ) : engagementData.length > 0 ? (
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(124, 58, 237)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="rgb(124, 58, 237)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} 
                        tickLine={false} 
                        axisLine={false}
                        dy={12}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-8}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: "16px", 
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor: "hsl(var(--popover))",
                          padding: "12px 16px"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="rgb(124, 58, 237)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorViolet)" 
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "rgb(124, 58, 237)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-4 opacity-40">
                  <BarChart3 className="size-10 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-widest">Collecting performance metrics...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Schedule & Top Content */}
        <div className="space-y-10">
          {/* Scheduled Content */}
          <Card className="rounded-[2.5rem] border-none bg-background shadow-lg shadow-muted/20 ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <div className="size-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                  <Clock className="size-5 text-violet-600" />
                </div>
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingPosts.length > 0 ? (
                <div className="divide-y divide-border/10">
                  {upcomingPosts.map((post: any) => {
                    const brand = PLATFORM_BRANDING[post.platforms?.[0]?.toLowerCase()];
                    const Icon = brand?.icon || ExternalLink;
                    return (
                      <div key={post.id} className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group flex items-center justify-between" onClick={() => window.location.href = `/dashboard/posts/${post.id}`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={cn("size-10 rounded-xl flex items-center justify-center bg-background border border-border/40 shrink-0 transition-all group-hover:shadow-md", brand?.color)}>
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-bold line-clamp-1 group-hover:text-violet-600 transition-colors">{post.content}</p>
                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                              {format(new Date(post.scheduledAt), "h:mm a")} • {brand?.label}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="size-4 text-muted-foreground/20 group-hover:text-violet-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Queue is empty</p>
                  <Button variant="link" size="sm" className="text-sm font-bold text-violet-600 p-0 h-auto" onClick={() => window.location.href = "/dashboard/compose"}>Schedule a post</Button>
                </div>
              )}
              <div className="p-4 bg-muted/20 border-t border-border/10">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-muted-foreground hover:text-violet-600" onClick={() => window.location.href = "/dashboard/calendar"}>
                  View full calendar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Drafts */}
          <Card className="rounded-[2.5rem] border-none bg-background shadow-lg shadow-muted/20 ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <div className="size-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                  <FileText className="size-5 text-violet-600" />
                </div>
                Drafts
              </CardTitle>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-violet-600/10 hover:text-violet-600" onClick={() => window.location.href = "/dashboard/compose"}>
                <Plus className="size-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentDrafts.length > 0 ? (
                <div className="divide-y divide-border/10">
                  {recentDrafts.map((post: any) => (
                    <div key={post.id} className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => window.location.href = `/dashboard/compose?id=${post.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                          {format(new Date(post.createdAt), "MMM d")}
                        </span>
                        <div className="flex -space-x-1.5">
                          {post.platforms?.map((p: string) => {
                            const BrandIcon = PLATFORM_BRANDING[p.toLowerCase()]?.icon || ExternalLink;
                            return (
                              <div key={p} className="size-5 rounded-full bg-background border border-border/40 flex items-center justify-center p-1 shadow-sm">
                                <BrandIcon className={cn("size-full", PLATFORM_BRANDING[p.toLowerCase()]?.color)} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-sm font-bold line-clamp-1 text-foreground/80 group-hover:text-violet-600 transition-colors">{post.content || "Untitled draft..."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">No drafts found</p>
                  <Button variant="link" size="sm" className="text-sm font-bold text-violet-600 p-0 h-auto" onClick={() => window.location.href = "/dashboard/compose"}>Create a draft</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Top Content (Full Width) ── */}
      <section className="space-y-8 mt-12 pb-12">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Top Content</h2>
            <p className="text-sm font-medium text-muted-foreground/60">Your best performing posts across all social networks</p>
          </div>
          <Button variant="ghost" size="sm" className="text-violet-600 font-bold" onClick={() => window.location.href = "/dashboard/analytics"}>
            View detailed analytics
          </Button>
        </div>

        {!hasAccounts || !hasPosts ? (
           <Card className="rounded-[2.5rem] border-none bg-muted/10 p-20 text-center flex flex-col items-center gap-4 ring-1 ring-border/50">
            <div className="bg-muted/20 p-8 rounded-full">
              <TrendingUp className="size-12 text-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold">No performance data yet</p>
              <p className="text-sm text-muted-foreground/40 max-w-sm mx-auto">Once you start posting, we'll showcase your most successful content here with detailed metrics.</p>
            </div>
          </Card>
        ) : topPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topPosts.slice(0, 4).map((post: any) => {
              const brand = PLATFORM_BRANDING[post.platform.toLowerCase()];
              const Icon = brand?.icon || ExternalLink;
              return (
                <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="block group h-full">
                  <Card className="rounded-[2.5rem] border-none bg-background shadow-sm ring-1 ring-border/50 hover:ring-violet-600/30 transition-all hover:shadow-2xl hover:shadow-violet-600/5 h-full overflow-hidden flex flex-col">
                    <CardContent className="p-8 flex flex-col flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className={cn("size-12 rounded-2xl flex items-center justify-center border border-border/40 shadow-sm transition-transform group-hover:scale-110", brand?.bg, brand?.color)}>
                          <Icon className="size-6" />
                        </div>
                        <Badge variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] px-3 py-1 uppercase tracking-wider">
                          Best Performing
                        </Badge>
                      </div>
                      
                      <p className="text-base font-bold line-clamp-4 text-foreground/90 group-hover:text-violet-600 transition-colors flex-1">
                        {post.content}
                      </p>

                      <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-y-4 gap-x-2">
                        <div className="flex items-center gap-2 group/metric">
                          <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                            <Heart className="size-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Likes</p>
                            <p className="text-sm font-black leading-none">{post.likes?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <MessageCircle className="size-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Comments</p>
                            <p className="text-sm font-black leading-none">{post.comments?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                            <Repeat2 className="size-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Shares</p>
                            <p className="text-sm font-black leading-none">{post.shares?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground">
                            <Eye className="size-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Reach</p>
                            <p className="text-sm font-black leading-none">{post.impressions?.toLocaleString() || "0"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-dashed border-border/50 p-20 text-center bg-muted/5">
            <p className="text-base font-bold text-muted-foreground/40 italic">Waiting for more data to highlight your top content</p>
          </div>
        )}
      </section>
    </div>
  );
}
