"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Info,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  X as CloseIcon,
  MessageSquare,
  Repeat2,
  Heart,
  Share,
  CalendarDays,
  X,
  Save
} from "lucide-react";
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter 
} from "@/components/platform-icons";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfDay,
  endOfDay,
  addDays,
  setHours,
  getHours,
  getMinutes,
  isSameHour,
  addWeeks,
  subWeeks,
  isBefore,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-[#E1306C]" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-[#0077B5]" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-[#1877F2]" },
  { id: "twitter", name: "X", icon: Twitter, color: "text-foreground" },
];

const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string, bg: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram", bg: "bg-[#E1306C]/10" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn", bg: "bg-[#0077B5]/10" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook", bg: "bg-[#1877F2]/10" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X", bg: "bg-foreground/20" },
};

const STATUS_CONFIG: Record<string, { label: string, icon: any, color: string, badge: string }> = {
  draft: { label: "Draft", icon: FileText, color: "text-slate-500", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  scheduled: { label: "Scheduled", icon: Clock, color: "text-blue-600", badge: "bg-blue-600 text-white border-transparent" },
  published: { label: "Published", icon: CheckCircle2, color: "text-emerald-600", badge: "bg-emerald-500 text-white border-transparent" },
};

// Heatmap Intensity colors
const getHeatmapColor = (intensity: number) => {
  if (intensity >= 80) return "bg-[#6D28D9]"; // Dark Violet
  if (intensity >= 50) return "bg-[#8B5CF6]"; // Medium Violet
  if (intensity > 0) return "bg-[#C4B5FD]"; // Light Violet
  return "bg-transparent";
};

// Mock best time percentage
const getBestTimePercentage = (platform: string, day: number, hour: number) => {
  const hash = (platform.length + day * 13 + hour * 7) % 10;
  if (hash > 8) return 82 + hash;
  if (hash > 5) return 46 + hash;
  if (hash > 3) return 15 + hash;
  return 0;
};

export default function CalendarPage() {
  const { mutate } = useSWRConfig();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Inline editing state
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSavingContent, setIsSavingContent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch connected accounts
  const { data: accountsData } = useSWR("/api/accounts", fetcher);
  const connectedPlatforms = useMemo(() => 
    (accountsData?.accounts || []).map((a: any) => a.platform), 
    [accountsData]
  );

  // Range calculation for API
  const range = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return { start, end };
    } else if (view === "week") {
      return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    } else {
      return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    }
  }, [currentDate, view]);

  const apiUrl = `/api/posts?status=scheduled&startDate=${range.start.toISOString()}&endDate=${range.end.toISOString()}&limit=200`;
  const { data, isLoading } = useSWR(apiUrl, fetcher);
  const posts = data?.posts || [];

  const filteredPosts = useMemo(() => {
    if (!selectedPlatform) return posts;
    return posts.filter((p: any) => p.platforms.includes(selectedPlatform));
  }, [posts, selectedPlatform]);

  const handleNavigate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate(prev => direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1));
    } else if (view === "week") {
      setCurrentDate(prev => direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === "prev" ? addDays(prev, -1) : addDays(prev, 1));
    }
  };

  const isPlatformConnected = (id: string) => connectedPlatforms.includes(id);

  const handlePlatformClick = (id: string) => {
    if (selectedPlatform === id) {
      setSelectedPlatform(null);
      return;
    }
    
    setSelectedPlatform(id);
    
    if (!connectedPlatforms.includes(id)) {
      toast.info(`Connect your ${id} account to unlock personalized best posting times.`, {
        action: { label: "Settings", onClick: () => window.location.href = "/dashboard/settings" }
      });
    } else {
      // Mock analyzing state for a newly connected account (Twitter in this scenario)
      if (id === "twitter") {
        toast.info("Analyzing your posting history. Best times will appear in 2 days.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted");
        setIsDialogOpen(false);
        mutate(apiUrl);
      } else {
        toast.error("Failed to delete post");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleDate || !selectedPost) return;
    setIsSavingSchedule(true);
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: rescheduleDate.toISOString() }),
      });
      if (res.ok) {
        toast.success("Post rescheduled!");
        setIsRescheduleOpen(false);
        // Refresh local data
        setSelectedPost({ ...selectedPost, scheduledAt: rescheduleDate.toISOString() });
        mutate(apiUrl);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to reschedule");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedPost || editedContent === selectedPost.content) {
      setIsEditingContent(false);
      return;
    }
    setIsSavingContent(true);
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        toast.success("Content updated!");
        setSelectedPost({ ...selectedPost, content: editedContent });
        setIsEditingContent(false);
        mutate(apiUrl);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to update content");
    } finally {
      setIsSavingContent(false);
    }
  };

  useEffect(() => {
    if (selectedPost) {
      setEditedContent(selectedPost.content);
      setIsEditingContent(false);
    }
  }, [selectedPost]);

  return (
    <div className="space-y-0 w-full mx-auto min-h-screen flex flex-col">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
        <p className="text-muted-foreground text-sm">Manage your content calendar</p>
      </div>

      {/* Unified Toolbar */}
      <div className="bg-card border-x rounded-t-3xl shadow-sm z-30">
        <div className="flex items-center h-14 px-4 gap-4 border-b border-border/40">
          {/* New Post Button */}
          <Button 
            className="rounded-xl h-9 px-4 font-semibold text-xs shadow-sm bg-primary hover:bg-primary/90 transition-all active:scale-95 shrink-0" 
            onClick={() => window.location.href = "/dashboard/compose"}
          >
            <Plus className="size-3 mr-1.5" /> New Post
          </Button>
          
          {/* Divider */}
          <div className="w-px h-6 bg-border/40"></div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleNavigate("prev")} className="h-7 w-7 rounded-lg">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleNavigate("next")} className="h-7 w-7 rounded-lg">
              <ChevronRight className="size-4" />
            </Button>
          </div>
          
          {/* Current Date Display */}
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground min-w-[100px] text-center">
            {format(currentDate, view === "day" ? "MMM d, yyyy" : "MMMM yyyy")}
          </div>
          
          {/* Today Button */}
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-7 text-[10px] font-bold px-3 rounded-lg border-border/40">
            Today
          </Button>
          
          {/* Divider */}
          <div className="w-px h-6 bg-border/40"></div>
          
          {/* View Switcher */}
          <Tabs value={view} onValueChange={(v: any) => setView(v)} className="bg-muted/30 p-1 rounded-xl">
            <TabsList className="bg-transparent h-7 border-none gap-0.5">
              <TabsTrigger value="month" className="rounded-lg px-3 text-[9px] font-bold data-[state=active]:bg-card h-5">Month</TabsTrigger>
              <TabsTrigger value="week" className="rounded-lg px-3 text-[9px] font-bold data-[state=active]:bg-card h-5">Week</TabsTrigger>
              <TabsTrigger value="day" className="rounded-lg px-3 text-[9px] font-bold data-[state=active]:bg-card h-5">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Divider */}
          <div className="w-px h-6 bg-border/40 ml-auto"></div>
          
          {/* Platform Filters */}
          <div className="flex items-center gap-1 px-1.5 py-1 bg-muted/30 rounded-xl">
            {PLATFORMS.filter(p => connectedPlatforms.includes(p.id)).map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatform === platform.id;
              const isConnected = isPlatformConnected(platform.id);
              return (
                <TooltipProvider key={platform.id}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant={isSelected ? "secondary" : "ghost"}
                          size="icon"
                          onClick={() => handlePlatformClick(platform.id)}
                          className={cn(
                            "h-7 w-7 rounded-lg transition-all relative",
                            isSelected && "bg-card shadow-sm",
                            !isConnected && "opacity-40 grayscale"
                          )}
                        />
                      }
                    >
                      <Icon className={cn("size-3", isSelected ? platform.color : "text-muted-foreground")} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isConnected ? platform.name : `Connect ${platform.name}`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        <Card className="border-border/50 border-t-0 rounded-b-3xl rounded-t-none overflow-hidden shadow-xl shadow-primary/5 bg-card flex flex-col flex-1">
          {view === "month" && (
            <MonthView 
              currentDate={currentDate} 
              posts={filteredPosts} 
              onPostClick={(p: any) => { setSelectedPost(p); setIsDialogOpen(true); }}
            />
          )}
          {view === "week" && (
            <WeekView 
              currentDate={currentDate} 
              posts={filteredPosts} 
              onPostClick={(p: any) => { setSelectedPost(p); setIsDialogOpen(true); }}
              selectedPlatform={selectedPlatform}
              isConnected={selectedPlatform ? isPlatformConnected(selectedPlatform) : false}
              currentTime={currentTime}
              isTwitterAnalyzed={selectedPlatform === "twitter"}
            />
          )}
          {view === "day" && (
            <DayView 
              currentDate={currentDate} 
              posts={filteredPosts} 
              onPostClick={(p: any) => { setSelectedPost(p); setIsDialogOpen(true); }}
              selectedPlatform={selectedPlatform}
              isConnected={selectedPlatform ? isPlatformConnected(selectedPlatform) : false}
              currentTime={currentTime}
              isTwitterAnalyzed={selectedPlatform === "twitter"}
            />
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl rounded-[40px] p-0 overflow-visible border-none shadow-2xl bg-background/95 backdrop-blur-2xl">
          {selectedPost && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] h-full max-h-[90vh]">
              {/* Left: Social Preview */}
              <div className="flex flex-col bg-muted/20 p-10 pt-16 items-center justify-center relative overflow-hidden">
                <div className="absolute top-8 left-10 flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-background/50 border-border/40 px-3 h-5">
                    Live Preview
                  </Badge>
                </div>
                
                <div className="mt-4 w-full flex justify-center">
                   <SocialPreview post={selectedPost} accounts={accountsData?.accounts || []} editedContent={isEditingContent ? editedContent : undefined} />
                </div>
                
                <div className="mt-10 text-center space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform View: {selectedPost.platforms[0]}</p>
                   <p className="text-[9px] text-muted-foreground/60 font-medium">This is exactly how your post will appear on social media.</p>
                </div>
              </div>

              {/* Right: Details & Actions */}
              <div className="bg-background p-8 border-l border-border/40 flex flex-col">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</h3>
                       <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-md", (STATUS_CONFIG[selectedPost.status] || STATUS_CONFIG.draft).badge)}>
                        {selectedPost.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.platforms.map((plt: string) => {
                        const brand = PLATFORM_BRANDING[plt];
                        const Icon = brand?.icon || ExternalLink;
                        return (
                          <div key={plt} className={cn("size-10 rounded-xl flex items-center justify-center shadow-inner", brand?.bg || "bg-muted")}>
                             <Icon className={cn("size-5", brand?.color || "text-foreground")} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Schedule Details</h3>
                     <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                         <div className="size-10 rounded-xl bg-background border border-border/40 flex items-center justify-center shadow-inner">
                            <Clock className="size-5 text-primary" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">Scheduled For</p>
                            <p className="text-sm font-bold">{format(new Date(selectedPost.scheduledAt), "MMM d, yyyy")}</p>
                            <p className="text-xs font-bold text-primary">{format(new Date(selectedPost.scheduledAt), "h:mm a")}</p>
                         </div>
                      </div>
                      <div className="flex justify-center w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest border-border/60 hover:bg-background"
                          onClick={() => {
                            setRescheduleDate(new Date(selectedPost.scheduledAt));
                            setIsRescheduleOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                  {isEditingContent ? (
                    <div className="space-y-3">
                       <textarea 
                          className="w-full h-32 p-4 text-sm font-medium bg-muted/20 border border-border/40 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                       />
                       <div className="flex gap-2">
                          <Button variant="ghost" className="flex-1 rounded-xl font-bold text-xs" onClick={() => setIsEditingContent(false)}>Cancel</Button>
                          <Button className="flex-1 rounded-xl h-11 font-black uppercase tracking-widest text-[11px] bg-primary shadow-lg shadow-primary/20" onClick={handleSaveContent} disabled={isSavingContent}>
                             {isSavingContent ? "Saving..." : "Save Content"}
                          </Button>
                       </div>
                    </div>
                  ) : (
                    <Button className="w-full rounded-2xl h-12 font-bold text-xs shadow-lg shadow-primary/10" onClick={() => setIsEditingContent(true)}>
                      <Edit className="size-4 mr-2" /> Edit Content
                    </Button>
                  )}
                  
                  <Button variant="ghost" className="w-full rounded-2xl h-11 text-destructive/60 hover:text-destructive hover:bg-destructive/5 font-bold text-xs" onClick={() => handleDelete(selectedPost.id)}>
                    <Trash2 className="size-4 mr-2" /> Delete Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border-none shadow-2xl bg-background/95 backdrop-blur-xl">
           <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-2">
                 <CalendarDays className="size-5 text-primary" />
                 Reschedule Post
              </DialogTitle>
           </DialogHeader>
           
           <div className="py-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Date</label>
                    <div className="p-1 rounded-2xl bg-muted/30 border border-border/40">
                      <Calendar
                        mode="single"
                        selected={rescheduleDate || undefined}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            if (rescheduleDate) {
                              newDate.setHours(rescheduleDate.getHours());
                              newDate.setMinutes(rescheduleDate.getMinutes());
                            }
                            setRescheduleDate(newDate);
                          }
                        }}
                        initialFocus
                        className="rounded-xl"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="time"
                        className="w-full h-12 pl-12 pr-4 text-sm font-bold bg-muted/30 border border-border/40 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        value={rescheduleDate ? format(rescheduleDate, "HH:mm") : ""}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":").map(Number);
                          const newDate = rescheduleDate ? new Date(rescheduleDate) : new Date();
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          setRescheduleDate(newDate);
                        }}
                      />
                    </div>
                 </div>
              </div>
           </div>

           <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" className="rounded-xl font-bold h-11" onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
              <Button className="rounded-xl px-8 h-11 font-black uppercase tracking-widest text-[11px] bg-primary" onClick={handleSaveReschedule} disabled={isSavingSchedule}>
                 {isSavingSchedule ? "Saving..." : "Save Schedule"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SocialPreview({ post, accounts, editedContent }: { post: any, accounts: any[], editedContent?: string }) {
  const platform = post.platforms[0];
  const account = accounts.find(a => a.platform.toLowerCase() === platform.toLowerCase()) || { username: "CreatablUser", profileUrl: "" };
  const content = editedContent ?? post.content;

  if (platform === "twitter" || platform === "x") {
    return (
      <div className="w-full max-w-[480px] bg-black text-white p-6 rounded-3xl shadow-2xl border border-white/10 font-sans">
        <div className="flex gap-3">
          <div className="size-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
             {account.profileUrl ? <img src={account.profileUrl} alt="" className="size-full object-cover" /> : <Twitter className="size-6 text-white/20" />}
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-0">
                   <span className="font-bold truncate">Creatabl User</span>
                   <span className="text-zinc-500 text-sm truncate">@{account.username}</span>
                   <span className="text-zinc-500 text-sm">· {format(new Date(post.scheduledAt), "MMM d")}</span>
                </div>
                <MoreHorizontal className="size-5 text-zinc-500" />
             </div>
             <p className="text-[15px] mt-1 leading-normal whitespace-pre-wrap">{content}</p>
             
             {post.mediaUrls?.[0] && (
               <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-800">
                  <img src={post.mediaUrls[0]} alt="" className="w-full aspect-video object-cover" />
               </div>
             )}

             <div className="mt-4 flex items-center justify-between text-zinc-500 max-w-[360px]">
                <div className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                  <MessageSquare className="size-4.5" />
                  <span className="text-xs font-medium">0</span>
                </div>
                <div className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Repeat2 className="size-4.5" />
                  <span className="text-xs font-medium">0</span>
                </div>
                <div className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                  <Heart className="size-4.5" />
                  <span className="text-xs font-medium">0</span>
                </div>
                <div className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                  <Share className="size-4.5" />
                  <span className="text-xs font-medium">0</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for other platforms
  const brand = PLATFORM_BRANDING[platform];
  const Icon = brand?.icon || ExternalLink;

  return (
    <div className="w-full max-w-[400px] bg-background border border-border/40 p-6 rounded-3xl shadow-xl">
       <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-muted border border-border/20 flex items-center justify-center">
             <Icon className={cn("size-5", brand?.color)} />
          </div>
          <div>
             <p className="text-sm font-black uppercase tracking-widest">{brand?.label || platform}</p>
             <p className="text-[10px] text-muted-foreground font-bold">@{account.username}</p>
          </div>
       </div>
       <p className="text-sm font-medium leading-relaxed mb-4 whitespace-pre-wrap italic">"{content}"</p>
       {post.mediaUrls?.[0] && (
         <div className="aspect-video rounded-2xl overflow-hidden border border-border/40 shadow-sm">
            <img src={post.mediaUrls[0]} alt="" className="size-full object-cover" />
         </div>
       )}
    </div>
  );
}

function MonthView({ currentDate, posts, onPostClick }: any) {
  const monthStart = startOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(endOfMonth(monthStart)) 
  });
  const today = new Date();

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-7 border-b bg-muted/20">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="py-3 text-center text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-r last:border-r-0">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar">
        {calendarDays.map((day, i) => {
          const dayPosts = posts.filter((p: any) => isSameDay(new Date(p.scheduledAt), day));
          const isSelectedMonth = isSameMonth(day, monthStart);
          const isPast = isBefore(startOfDay(day), startOfDay(today));
          const hasPosts = dayPosts.length > 0;
          
          return (
            <div 
              key={i} 
              className={cn(
                "min-h-[140px] p-2 border-r border-b last:border-r-0 relative transition-all group cursor-pointer",
                !isSelectedMonth ? "bg-muted/5 opacity-40" : "bg-card hover:bg-primary/[0.01]",
                isToday(day) && "bg-primary/[0.02] ring-2 ring-inset ring-primary/20"
              )}
              onClick={() => !isPast && isSelectedMonth && (window.location.href = `/dashboard/compose?date=${day.toISOString()}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-xs font-black size-7 flex items-center justify-center rounded-xl", 
                  isToday(day) ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40"
                )}>{format(day, "d")}</span>
                
                {hasPosts && !isPast && isSelectedMonth && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 text-primary" 
                    onClick={() => window.location.href = `/dashboard/compose?date=${day.toISOString()}`}
                  >
                    <Plus className="size-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-1">
                {dayPosts.map((p: any) => {
                  const firstPlatform = p.platforms?.[0];
                  const brand = PLATFORM_BRANDING[firstPlatform];
                  const PlatformIcon = brand?.icon || ExternalLink;
                  
                  return (
                    <div 
                      key={p.id} 
                      className={cn(
                        "p-1.5 rounded-lg bg-background border text-[10px] font-bold truncate cursor-pointer hover:border-primary/50 shadow-sm transition-all flex items-center gap-1.5",
                        brand?.color === 'text-foreground' ? "bg-zinc-950 text-white border-zinc-800" : ""
                      )} 
                      onClick={(e) => { e.stopPropagation(); onPostClick(p); }}
                    >
                      <PlatformIcon className={cn("size-3 shrink-0", brand?.color === 'text-foreground' ? "text-white" : brand?.color || "text-foreground")} />
                      <span className="truncate">{p.content}</span>
                    </div>
                  );
                })}
              </div>

              {!hasPosts && !isPast && isSelectedMonth && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="size-8 rounded-xl shadow-xl shadow-primary/20 pointer-events-auto bg-[#8B5CF6] hover:bg-[#6D28D9]" 
                    onClick={() => window.location.href = `/dashboard/compose?date=${day.toISOString()}`}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ currentDate, posts, onPostClick, selectedPlatform, isConnected, currentTime, isTwitterAnalyzed }: any) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = getHours(new Date()) * 60 - 120;
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth" ref={gridRef}>
        {/* Sticky Header inside the scrollable container to maintain alignment */}
        <div className="sticky top-0 z-20">
          <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b bg-muted/20 backdrop-blur-md">
            <div className="border-r border-border/40 h-14" />
            {weekDays.map(day => (
              <div key={day.toISOString()} className={cn("py-2 h-14 text-center border-r border-border/40 last:border-r-0 flex flex-col items-center justify-center gap-0.5", isToday(day) && "bg-primary/[0.04]")}>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">{format(day, "EEE")}</span>
                <span className={cn("text-sm font-black size-7 flex items-center justify-center rounded-lg transition-colors", isToday(day) ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/80")}>{format(day, "d")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[100px_repeat(7,1fr)] relative">
          {/* Hour Labels */}
          <div className="flex flex-col bg-muted/5 z-10">
            {hours.map(h => (
              <div key={h} className="h-[60px] border-r border-b border-border/40 text-[9px] font-black text-muted-foreground/40 flex items-start justify-center pt-1.5">
                {format(setHours(new Date(), h), "HH'h'")}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          {weekDays.map((day, dIdx) => (
            <div key={dIdx} className="flex flex-col border-r border-border/40 last:border-r-0 relative">
              {hours.map(h => {
                const showHeatmap = selectedPlatform && isConnected && !isTwitterAnalyzed;
                const intensity = showHeatmap ? getBestTimePercentage(selectedPlatform!, dIdx, h) : 0;
                const dayPosts = posts.filter((p: any) => isSameDay(new Date(p.scheduledAt), day) && isSameHour(new Date(p.scheduledAt), setHours(day, h)));
                return (
                  <div 
                    key={h} 
                    className={cn("h-[60px] border-b border-border/40 relative group p-0.5 cursor-pointer hover:bg-primary/[0.02] transition-colors", getHeatmapColor(intensity))}
                    onClick={() => !isBefore(startOfDay(day), startOfDay(new Date())) && (window.location.href=`/dashboard/compose?date=${setHours(day, h).toISOString()}`)}
                  >
                    {intensity > 0 && (
                      <span className="absolute top-1 right-1 text-[8px] font-black text-primary/60">{intensity}%</span>
                    )}
                    {dayPosts.map((p: any) => {
                      const firstPlatform = p.platforms?.[0];
                      const brand = PLATFORM_BRANDING[firstPlatform];
                      const PlatformIcon = brand?.icon || ExternalLink;
                      return (
                        <div 
                          key={p.id} 
                          className={cn(
                            "p-1 rounded-md bg-card border shadow-sm text-[9px] font-bold truncate cursor-pointer z-10 relative hover:border-primary/50 flex items-center gap-1 transition-all",
                            brand?.color === 'text-foreground' ? "bg-zinc-950 text-white border-zinc-800" : ""
                          )} 
                          onClick={(e) => { e.stopPropagation(); onPostClick(p); }}
                        >
                          <PlatformIcon className={cn("size-2.5 shrink-0", brand?.color === 'text-foreground' ? "text-white" : brand?.color || "text-foreground")} />
                          <span className="truncate">{p.content}</span>
                        </div>
                      );
                    })}
                    {!isBefore(startOfDay(day), startOfDay(new Date())) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "absolute size-5 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary rounded-md z-20",
                          dayPosts.length > 0 ? "top-0.5 right-0.5" : "bottom-1 right-1"
                        )} 
                        onClick={() => window.location.href=`/dashboard/compose?date=${setHours(day, h).toISOString()}`}
                      >
                        <Plus className="size-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Current Time Line */}
          <div className="absolute left-[100px] right-0 h-px bg-primary z-30 pointer-events-none flex items-center shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ top: `${(getHours(currentTime) * 60) + (getMinutes(currentTime) * 60 / 60) + 56}px` }}>
            <div className="px-2 py-0.5 rounded-full bg-primary text-[9px] font-black text-primary-foreground absolute left-[-45px] -top-2 shadow-lg">
              {format(currentTime, "HH:mm")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayView({ currentDate, posts, onPostClick, selectedPlatform, isConnected, currentTime, isTwitterAnalyzed }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = getHours(new Date()) * 70 - 100;
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth" ref={gridRef}>
        <div className="sticky top-0 z-20">
          <div className="grid grid-cols-[100px_1fr] border-b bg-muted/10 backdrop-blur-md h-14">
            <div className="border-r border-border/40 h-14" />
            <div className="flex items-center justify-center px-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground/80">{format(currentDate, "EEEE, MMMM do")}</h2>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[100px_1fr]">
          <div className="flex flex-col border-r border-border/40 bg-muted/5 z-10">
            {hours.map(h => (
              <div key={h} className="h-[70px] border-b border-border/40 flex items-center justify-center">
                <span className="text-[10px] font-black text-muted-foreground/40">{format(setHours(new Date(), h), "HH'h'")}</span>
              </div>
            ))}
          </div>
          <div className="relative">
            {hours.map(h => {
              const showHeatmap = selectedPlatform && isConnected && !isTwitterAnalyzed;
              const intensity = showHeatmap ? getBestTimePercentage(selectedPlatform!, currentDate.getDay(), h) : 0;
              const hourPosts = posts.filter((p: any) => isSameDay(new Date(p.scheduledAt), currentDate) && isSameHour(new Date(p.scheduledAt), setHours(currentDate, h)));
              return (
                <div 
                  key={h} 
                  className={cn("h-[70px] border-b border-border/40 p-3 flex gap-3 group relative transition-colors cursor-pointer hover:bg-primary/[0.02]", getHeatmapColor(intensity))}
                  onClick={() => !isBefore(startOfDay(currentDate), startOfDay(new Date())) && (window.location.href=`/dashboard/compose?date=${setHours(currentDate, h).toISOString()}`)}
                >
                  {intensity > 0 && (
                    <span className="absolute top-1 right-2 text-[8px] font-black text-primary/60">{intensity}% Engagement Signal</span>
                  )}
                  {hourPosts.map((p: any) => {
                    const firstPlatform = p.platforms?.[0];
                    const brand = PLATFORM_BRANDING[firstPlatform];
                    const PlatformIcon = brand?.icon || ExternalLink;
                    return (
                      <div 
                        key={p.id} 
                        className={cn(
                          "min-w-[140px] max-w-[300px] p-2 rounded-xl bg-card border shadow-sm text-xs font-bold cursor-pointer z-10 hover:border-primary/50 flex items-center gap-2 transition-all",
                          brand?.color === 'text-foreground' ? "bg-zinc-950 text-white border-zinc-800" : ""
                        )} 
                        onClick={(e) => { e.stopPropagation(); onPostClick(p); }}
                      >
                        <PlatformIcon className={cn("size-4 shrink-0", brand?.color === 'text-foreground' ? "text-white" : brand?.color || "text-foreground")} />
                        <span className="truncate">{p.content}</span>
                      </div>
                    );
                  })}
                  {!isBefore(startOfDay(currentDate), startOfDay(new Date())) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "absolute size-8 opacity-0 group-hover:opacity-100 bg-primary/5 text-primary rounded-xl transition-all z-20",
                        hourPosts.length > 0 ? "top-2 right-2" : "bottom-2 right-2"
                      )} 
                      onClick={() => window.location.href=`/dashboard/compose?date=${setHours(currentDate, h).toISOString()}`}
                    >
                      <Plus className="size-4" />
                    </Button>
                  )}
                </div>
              );
            })}
            {isToday(currentDate) && (
              <div className="absolute left-0 right-0 h-px bg-primary z-30 pointer-events-none flex items-center shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ top: `${(getHours(currentTime) * 70) + (getMinutes(currentTime) * 70 / 60) + 60}px` }}>
                <div className="px-2 py-0.5 rounded-full bg-primary text-[9px] font-black text-white absolute left-[-45px] -top-2 shadow-lg">
                  {format(currentTime, "HH:mm")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
