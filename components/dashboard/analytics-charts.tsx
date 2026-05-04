"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function ReachLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(str) => {
            const date = new Date(str);
            return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
          }}
        />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="reach" 
          stroke="#8884d8" 
          strokeWidth={2}
          dot={false}
          name="Portée totale"
        />
        <Line 
          type="monotone" 
          dataKey="impressions" 
          stroke="#82ca9d" 
          strokeWidth={2}
          dot={false}
          name="Impressions totales"
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export function PlatformDonutChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="count"
          nameKey="platform"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RePieChart>
    </ResponsiveContainer>
  );
}

export function ContentVelocityChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(str) => {
            const date = new Date(str);
            return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
          }}
        />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
        />
        <Tooltip />
        <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" name="Posts" />
      </ReBarChart>
    </ResponsiveContainer>
  );
}
