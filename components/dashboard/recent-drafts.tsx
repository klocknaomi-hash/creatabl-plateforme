import Link from "next/link";
import { Plus } from "lucide-react";
import { getRecentDrafts } from "@/lib/dashboard-data";
import { NetworkStack } from "@/components/ds/NetworkLogo";
import { formatPostDate } from "@/components/ds";

import { auth } from "@clerk/nextjs/server";

interface RecentDraftsProps {
  recentDrafts: any[];
}

export async function RecentDrafts() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  try {
    const drafts = await getRecentDrafts(clerkId);
    return <RecentDraftsView recentDrafts={drafts} />;
  } catch (error) {
    console.error("RecentDrafts error:", error);
    return <RecentDraftsView recentDrafts={[]} />;
  }
}

// Panneau « Brouillons » du tableau de bord.
export function RecentDraftsView({ recentDrafts }: RecentDraftsProps) {
  return (
    <section className="ap-panel" aria-labelledby="dash-drafts">
      <div className="ap-panel-head">
        <h2 id="dash-drafts">Brouillons</h2>
        <Link href="/dashboard/compose" className="cr-iconbtn" aria-label="Créer un post" style={{ width: 32, height: 32 }}>
          <Plus size={18} aria-hidden="true" />
        </Link>
      </div>
      {recentDrafts.length > 0 ? (
        <ul className="ap-list">
          {recentDrafts.map((post: any) => (
            <li key={post.id}>
              <Link href={`/dashboard/compose?id=${post.id}`} className="ap-row">
                <span className="min-w-0 flex-1">
                  <p>{post.content || "Brouillon sans texte"}</p>
                  <small>Créé le {formatPostDate(post.createdAt)}</small>
                </span>
                <NetworkStack platforms={post.platforms ?? []} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="ap-panel-body text-sm text-[#4B4B63]">
          Aucun brouillon. Les posts enregistrés sans être programmés apparaîtront ici.
        </div>
      )}
      <div className="ap-panel-foot">
        <Link href="/dashboard/posts?status=draft" className="cr-link">Voir tous les brouillons</Link>
      </div>
    </section>
  );
}
