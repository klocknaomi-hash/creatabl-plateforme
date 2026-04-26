import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { PlanType } from "@/lib/plan-limits";

interface UsageProps {
  data: {
    plan: PlanType;
    usage: {
      socialAccounts: number;
      postsPerMonth: number;
      autoReplyRules: number;
    };
    limits: {
      socialAccounts: number;
      postsPerMonth: number;
      autoReplyRules: number;
    };
  };
}

export function UsageMetrics({ data }: UsageProps) {
  const { usage, limits } = data;

  const stats = [
    {
      label: "MONTHLY POSTS",
      current: usage.postsPerMonth,
      limit: limits.postsPerMonth,
      unit: "posts",
    },
    {
      label: "SOCIAL ACCOUNTS",
      current: usage.socialAccounts,
      limit: limits.socialAccounts,
      unit: "accounts",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stats.map((stat) => {
        const percentage = Math.min((stat.current / stat.limit) * 100, 100);
        const displayLimit = stat.limit >= 2000 ? "∞" : stat.limit;

        return (
          <Card key={stat.label} className="border-none bg-muted/30 shadow-none rounded-2xl overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                  {stat.label}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black">{stat.current}</span>
                    <span className="text-muted-foreground font-bold text-sm">/ {displayLimit}</span>
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-1.5 bg-background/50" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
