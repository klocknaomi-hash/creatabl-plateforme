import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PlanType } from "@/lib/plan-limits";

interface PremiumBenefitsProps {
  plan: PlanType;
}

export function PremiumBenefits({ plan }: PremiumBenefitsProps) {
  const isPro = plan === 'pro' || plan === 'business';

  const benefits = [
    "Unlimited Scheduled Posts",
    "20 Social Accounts",
    "AI Auto-Replies",
    "Advanced AI Captions",
    "Calendar Drag-and-Drop",
    "Priority API Requests",
  ];

  return (
    <Card className="rounded-[32px] border-border/50 shadow-xl overflow-hidden bg-gradient-to-br from-card to-muted/20 border-primary/10">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-xl font-black flex items-center gap-2">
          <Sparkles className="size-5 text-primary fill-primary/20" />
          Premium Benefits
        </CardTitle>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Available with Premium plan
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-primary/10 rounded-full p-1">
                <Check className="size-3 text-primary stroke-[3]" />
              </div>
              {benefit}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-6">
        {isPro ? (
          <Badge className="w-full justify-center py-2 rounded-xl bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest">
            Active Plan Features
          </Badge>
        ) : (
          <Button className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest py-6 shadow-lg shadow-primary/20">
            Upgrade to Premium
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
