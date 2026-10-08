import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { getUpcomingPosts } from "@/lib/dashboard-data";
import { NetworkStack } from "@/components/ds/NetworkLogo";
import { EmptyState, formatPostDate } from "@/components/ds";
import { GenerateWeekButton } from "@/components/dashboard/generate-week-button";

import { auth } from "@clerk/nextjs/server";

interface UpcomingScheduleProps {
  upcomingPosts: any[];
}

export async function UpcomingSchedule() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  try {
    const posts = await getUpcomingPosts(clerkId);
    return <UpcomingScheduleView upcomingPosts={posts} />;
  } catch (error) {
    console.error("UpcomingSchedule error:", error);
    return <UpcomingScheduleView upcomingPosts={[]} />;
  }
}

// Panneau « À venir » du tableau de bord (DashboardPage du design system).
export function UpcomingScheduleView({ upcomingPosts }: UpcomingScheduleProps) {
  return (
    <section className="ap-panel" aria-labelledby="dash-upcoming">
      <div className="ap-panel-head">
        <h2 id="dash-upcoming">À venir</h2>
        <Link href="/dashboard/calendar" className="cr-link">
          <CalendarDays size={16} aria-hidden="true" />
          Calendrier
        </Link>
      </div>
      {upcomingPosts.length > 0 ? (
        <ul className="ap-list">
          {upcomingPosts.map((post: any) => (
            <li key={post.id}>
              <Link href={`/dashboard/posts/${post.id}`} className="ap-row">
                <NetworkStack platforms={post.platforms ?? []} />
                <span className="min-w-0 flex-1">
                  <p>{post.content}</p>
                  <small>{formatPostDate(post.scheduledAt)}</small>
                </span>
                <span className="cr-badge cr-badge--info">Programmé</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          bordered={false}
          title="Aucun post programmé"
          text="Votre calendrier est vide pour l'instant. Créez un premier post ou laissez l'IA vous proposer une semaine de contenus."
        >
          <GenerateWeekButton />
          <Link href="/dashboard/compose" className="cr-btn cr-btn--secondary">
            <Plus size={18} aria-hidden="true" />
            Créer un post
          </Link>
        </EmptyState>
      )}
    </section>
  );
}
