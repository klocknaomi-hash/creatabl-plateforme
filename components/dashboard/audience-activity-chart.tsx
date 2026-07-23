"use client";

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
import { BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudienceActivityChartProps {
  engagementData: any[];
  hasAccounts: boolean;
  hasPosts: boolean;
}

export function AudienceActivityChart({
  engagementData,
  hasAccounts,
  hasPosts,
}: AudienceActivityChartProps) {
  if (!hasAccounts) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-6">
        <div className="bg-violet-600/5 p-6 rounded-full">
          <BarChart3 className="size-10 text-violet-600/40" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
            Unlock deeper insights
          </p>
          <Button
            variant="outline"
            className="rounded-xl border-violet-600/20 text-violet-600 font-bold hover:bg-violet-600/5"
            onClick={() => (window.location.href = "/dashboard/settings/connections")}
          >
            Connect your social accounts
          </Button>
        </div>
      </div>
    );
  }

  if (!hasPosts) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-6">
        <div className="bg-violet-600/5 p-6 rounded-full">
          <TrendingUp className="size-10 text-violet-600/40" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
            Waiting for data
          </p>
          <p className="text-xs text-muted-foreground/50 max-w-[250px]">
            Once you start posting, your audience activity will appear here in
            real-time.
          </p>
        </div>
      </div>
    );
  }

  if (engagementData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-center space-y-4 opacity-40">
        <BarChart3 className="size-10 text-muted-foreground" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Collecting performance metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={engagementData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(124, 58, 237)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="rgb(124, 58, 237)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border/40"
          />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 11,
              fontWeight: 600,
              fill: "hsl(var(--muted-foreground))",
            }}
            tickLine={false}
            axisLine={false}
            dy={12}
          />
          <YAxis
            tick={{
              fontSize: 11,
              fontWeight: 600,
              fill: "hsl(var(--muted-foreground))",
            }}
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
              padding: "12px 16px",
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
  );
}
