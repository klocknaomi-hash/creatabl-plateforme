"use client";

import { EmptyState } from "@/components/ds";

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
      <EmptyState
        bordered={false}
        illustration="chart"
        title="Pas encore de statistiques"
        text="Connectez un réseau social pour suivre l'activité de votre audience."
      >
        <a href="/dashboard/settings/connections" className="cr-btn cr-btn--secondary">Connecter un compte</a>
      </EmptyState>
    );
  }

  if (!hasPosts || engagementData.length === 0) {
    return (
      <EmptyState
        bordered={false}
        illustration="chart"
        title="Pas encore de statistiques"
        text="Les chiffres apparaissent 24 heures après votre première publication."
      />
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
