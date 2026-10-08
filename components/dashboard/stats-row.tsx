import Link from "next/link";
import { Eye, Heart, CalendarClock, FileText } from "lucide-react";
import { getDashboardStats, getCachedUserSettings, getCachedAccounts } from "@/lib/dashboard-data";
import { getTranslation } from "@/lib/i18n";

import { auth } from "@clerk/nextjs/server";

interface StatsRowProps {
  summary: any;
  upcomingCount: number;
  hasAccounts?: boolean;
  hasPosts: boolean;
  t: any;
}

export async function StatsRow() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  try {
    const [stats, settings, accounts] = await Promise.all([
      getDashboardStats(clerkId),
      getCachedUserSettings(clerkId),
      getCachedAccounts(clerkId),
    ]);

    const t = getTranslation(settings?.language || "fr");
    const hasAccounts = (accounts || []).length > 0;
    const hasPosts = Number(stats.totalPosts || 0) > 0;


    return (
      <StatsRowView 
        summary={stats} 
        upcomingCount={stats.upcomingCount} 
        hasAccounts={hasAccounts} 
        hasPosts={hasPosts} 
        t={t} 
      />
    );
  } catch (error) {
    console.error("StatsRow error:", error);
    return null;
  }
}

const nf = new Intl.NumberFormat("fr-FR");

export function StatsRowView({ summary, upcomingCount, hasPosts, t }: StatsRowProps) {
  // StatCard du design system : uniquement des chiffres réels, « — » tant qu'il n'y a pas de données.
  const cards = [
    {
      id: "stat-total-reach",
      label: t.totalReach,
      icon: Eye,
      value: hasPosts ? nf.format(Number(summary.totalReach || 0)) : "—",
      context: hasPosts ? "Toutes plateformes" : "Après votre premier post",
      href: "/dashboard/analytics",
      empty: !hasPosts,
    },
    {
      id: "stat-engagement",
      label: t.engagement,
      icon: Heart,
      value: hasPosts ? `${Number(summary.avgEngagementRate || 0).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %` : "—",
      context: hasPosts ? "Taux moyen" : "Après votre premier post",
      href: "/dashboard/analytics",
      empty: !hasPosts,
    },
    {
      id: "stat-scheduled",
      label: t.scheduled,
      icon: CalendarClock,
      value: nf.format(Number(upcomingCount || 0)),
      context: "Posts à venir",
      href: "/dashboard/calendar",
      empty: false,
    },
    {
      id: "stat-drafts",
      label: "Brouillons",
      icon: FileText,
      value: nf.format(Number(summary.totalDrafts || 0)),
      context: "Prêts à finaliser",
      href: "/dashboard/posts?status=draft",
      empty: false,
    },
  ];

  return (
    <section className="ap-stats" aria-label="Indicateurs">
      {cards.map((card) => (
        <Link key={card.id} id={card.id} href={card.href} className="cr-stat">
          <span className="cr-stat-label">
            <card.icon size={18} aria-hidden="true" />
            {card.label}
          </span>
          <span className={`cr-stat-value${card.empty ? " is-empty" : ""}`}>{card.value}</span>
          <div className="cr-stat-foot">
            <span>{card.context}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
