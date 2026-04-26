"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus, MessageSquareReply, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { RulesList } from "@/components/auto-reply/rules-list";
import { RuleForm } from "@/components/auto-reply/rule-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function AutoReplyPage() {
  const { user } = useUser();
  const [rules, setRules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  
  const isPremium = userPlan !== "free";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, accountsRes] = await Promise.all([
        fetch("/api/auto-reply"),
        fetch("/api/accounts")
      ]);

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules);
        setUserPlan(rulesData.userPlan);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSuccess = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    fetchData();
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const allLogs = rules
    .flatMap((rule: any) => rule.logs || [])
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalReplies = rules.reduce((acc, rule: any) => acc + (rule.logs?.length || 0), 0);
  const aiReplies = rules.reduce((acc, rule: any) => acc + (rule.logs?.filter((l: any) => l.isAi).length || 0), 0);

  return (
    <div className="relative w-full min-h-[calc(100vh-160px)] flex flex-col">
      {/* Premium Lock State Overlay */}
      {!isPremium && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-slate-950/50 backdrop-grayscale-[0.5] pointer-events-auto rounded-3xl overflow-hidden transition-all duration-700 pt-[15vh]">
          <div className="max-w-[340px] w-full mx-4 space-y-5 bg-slate-900 p-8 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/5 text-center relative z-50 animate-in fade-in zoom-in duration-500">
            <div className="bg-white/5 size-14 rounded-xl flex items-center justify-center mx-auto mb-1 border border-white/10 shadow-inner">
              <Lock className="size-6 text-white/70" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-white">Unlock Auto-Reply</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upgrade to Pro to enable AI-powered comment automation.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-1">
              <Button render={<Link href="/dashboard/billing" />} className="w-full h-11 text-sm font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-all rounded-lg">
                Upgrade to Pro
              </Button>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Available on Pro plan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content - Visible behind overlay for Free users */}
      <div className={cn("max-w-6xl mx-auto space-y-8 transition-all duration-500 w-full", !isPremium && "select-none pointer-events-none opacity-60 grayscale-[0.3]")}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Auto-Reply</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                <Sparkles className="size-3 mr-1" />
                AI Powered
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Automate your engagement with smart, keyword-based or AI-generated responses.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => setEditingRule(null)}>
                <Plus className="size-4" />
                Create Rule
              </Button>
            } />
            {isPremium && (
              <RuleForm 
                initialData={editingRule} 
                accounts={accounts} 
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </Dialog>
        </div>

        {/* Rules List / Preview */}
        <div className="bg-background rounded-2xl border shadow-sm overflow-hidden">
          <RulesList 
            rules={!isPremium && rules.length === 0 ? (
              accounts.length > 0 ? accounts.map((acc: any, i: number) => ({
                id: `mock-${i}`,
                name: `${acc.platform === 'twitter' ? 'X' : acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)} Assistant`,
                triggerType: i === 0 ? "keyword" : "all",
                keywords: i === 0 ? ["help", "support", "price"] : [],
                useAi: true,
                tone: i === 0 ? "Friendly" : "Witty",
                isActive: false,
                socialAccount: acc
              })) : []
            ) : rules} 
            onEdit={handleEdit} 
            onRefresh={fetchData} 
          />
        </div>

        {/* Automation Cards / Stats Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-2xl bg-muted/20 space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">Total Replies</p>
            <p className="text-2xl font-bold tracking-tight">{isPremium ? totalReplies : "---"}</p>
          </div>
          <div className="p-6 border rounded-2xl bg-muted/20 space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">AI Generated</p>
            <p className="text-2xl font-bold tracking-tight">{isPremium ? aiReplies : "---"}</p>
          </div>
          <div className="p-6 border rounded-2xl bg-muted/20 space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">Time Saved</p>
            <p className="text-2xl font-bold tracking-tight">{isPremium ? `~${(totalReplies * 2 / 60).toFixed(1)} hrs` : "---"}</p>
          </div>
        </div>

        {/* Recent Activity Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">View Logs</Button>
          </div>
          <div className="border rounded-2xl bg-muted/10 overflow-hidden min-h-[100px] flex flex-col justify-center">
            {allLogs.length > 0 ? (
              <div className="divide-y divide-border/40">
                {allLogs.map((log: any, i: number) => (
                  <div key={log.id || i} className="p-4 flex items-center justify-between gap-4 text-sm bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-background border flex items-center justify-center font-bold text-[10px] uppercase tracking-tighter">
                        {log.platform === 'twitter' ? 'X' : log.platform}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs">Comment</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">"{log.commentText}"</p>
                      </div>
                    </div>
                    <div className="flex-1 text-xs italic text-muted-foreground/60 line-clamp-1">
                      Reply: "{log.replyText}"
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <MessageSquareReply className="size-8 text-muted-foreground/20 mx-auto" />
                <p className="text-sm font-medium text-muted-foreground">No recent auto-reply activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
