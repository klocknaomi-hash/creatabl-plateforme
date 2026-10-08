import Link from "next/link";
import { Eye, Heart, Send } from "lucide-react";
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

export function StatsRowView({ summary, hasPosts }: StatsRowProps) {
  // « Performances sur 30 jours » (DashboardPage du design system) : portée, engagement,
  // posts publiés. « — » tant qu'il n'y a pas de données, rien n'est inventé.
  const published = Number(summary.totalPosts || 0);
  const cards = [
    {
      id: "stat-total-reach",
      label: "Portée",
      icon: Eye,
      value: hasPosts ? nf.format(Number(summary.totalReach || 0)) : "—",
      context: hasPosts ? "Personnes touchées, tous réseaux" : "Pas encore de données",
      empty: !hasPosts,
    },
    {
      id: "stat-engagement",
      label: "Taux d'engagement",
      icon: Heart,
      value: hasPosts ? `${Number(summary.avgEngagementRate || 0).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %` : "—",
      context: hasPosts ? "Moyenne de vos posts" : "Pas encore de données",
      empty: !hasPosts,
    },
    {
      id: "stat-published",
      label: "Posts publiés",
      icon: Send,
      value: hasPosts ? nf.format(published) : "—",
      context: hasPosts ? "Sur les 30 derniers jours" : "Pas encore de données",
      empty: !hasPosts,
    },
  ];

  return (
    <section className="grid gap-3" aria-labelledby="perf-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="perf-title" className="font-heading text-lg font-semibold text-[#14121F]">Performances sur 30 jours</h2>
        {hasPosts ? (
          <Link href="/dashboard/analytics" className="cr-link">Voir l&apos;analytique</Link>
        ) : (
          <span className="text-sm text-[#6B6780]">Disponibles 24 heures après votre premier post</span>
        )}
      </div>
      <div className="ap-stats ap-stats--3">
        {cards.map((card) => (
          <article key={card.id} id={card.id} className="cr-stat">
            <span className="cr-stat-label">
              <card.icon size={18} aria-hidden="true" />
              {card.label}
            </span>
            <span className={`cr-stat-value${card.empty ? " is-empty" : ""}`}>{card.value}</span>
            <div className="cr-stat-foot">
              <span>{card.context}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
