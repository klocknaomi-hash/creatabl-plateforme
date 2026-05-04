import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { UsageMetrics } from "./current-usage";
import { PlanType } from "@/lib/plan-limits";

interface SubscriptionCardProps {
  usageData: any;
  plan: PlanType;
}

export function SubscriptionCard({ usageData, plan }: SubscriptionCardProps) {
  const planDisplayName = plan === 'starter' ? 'Starter' : plan === 'pro' ? 'Pro' : 'Business';
  const planFullName = plan === 'starter' ? 'Plan Starter' : `Payant (${planDisplayName})`;

  return (
    <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-8 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <CreditCard className="size-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Plan actuel</span>
            <CardTitle className="text-2xl font-black">
              <span className="text-primary">{planFullName}</span>
              {plan !== 'starter' && <span className="ml-2 text-primary opacity-20">●</span>}
            </CardTitle>
          </div>
        </div>
        <Badge className="rounded-full px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-[10px] uppercase tracking-[0.2em] shadow-none">
          Plan actif
        </Badge>
      </CardHeader>
      
      <CardContent className="py-8 space-y-8 flex-1">
        <UsageMetrics data={usageData} />
      </CardContent>

      <CardFooter className="border-t border-border/40 py-6 bg-muted/10 flex items-center justify-between">
        <span className="text-sm font-bold text-muted-foreground">
          Gérer votre Plan via Clerk
        </span>
        <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-border/60 hover:bg-background shadow-sm group">
          Portail client
          <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      </CardFooter>
    </Card>
  );
}
