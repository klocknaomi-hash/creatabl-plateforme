import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Eye } from "lucide-react";
import { NetworkStack } from "@/components/ds/NetworkLogo";
import { EmptyState as DsEmptyState } from "@/components/ds";
import { getTopContent, getCachedAccounts } from "@/lib/dashboard-data";

import { auth } from "@clerk/nextjs/server";

interface TopContentProps {
  topPosts: any[];
  hasAccounts: boolean;
  hasPosts: boolean;
}

export async function TopContent() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  try {
    const [topPosts, accounts] = await Promise.all([
      getTopContent(clerkId),
      getCachedAccounts(clerkId),
    ]);

    const hasAccounts = (accounts || []).length > 0;
    const hasPosts = topPosts.length > 0;

    if (!hasAccounts) return null;

    return (
      <TopContentView 
        topPosts={topPosts} 
        hasAccounts={hasAccounts} 
        hasPosts={hasPosts} 
      />
    );
  } catch (error) {
    console.error("TopContent error:", error);
    return null;
  }
}

const nf = new Intl.NumberFormat("fr-FR");

// « Meilleurs posts » : PostCard du design system complétée des résultats réels.
export function TopContentView({ topPosts, hasAccounts, hasPosts }: TopContentProps) {
  return (
    <section className="ap-panel" aria-labelledby="dash-top">
      <div className="ap-panel-head">
        <div>
          <h2 id="dash-top">Meilleurs posts</h2>
          <p className="text-sm text-[#4B4B63]">Vos publications les plus performantes, tous réseaux confondus</p>
        </div>
        <Link href="/dashboard/analytics" className="cr-link">Voir les analytics</Link>
      </div>
      {!hasAccounts || !hasPosts || topPosts.length === 0 ? (
        <DsEmptyState
          bordered={false}
          illustration="chart"
          title="Pas encore de meilleurs posts"
          text="Dès vos premières publications, vos posts les plus réussis apparaîtront ici avec leurs résultats."
        />
      ) : (
        <div className="ap-panel-body grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topPosts.slice(0, 4).map((post: any) => (
            <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="cr-post h-full transition-shadow hover:shadow-[0_1px_2px_rgba(20,18,31,0.06)]">
              <div className="cr-post-head">
                <NetworkStack platforms={[post.platform]} />
                <span className="cr-badge cr-badge--success">Publié</span>
              </div>
              <div className="cr-post-body" style={{ gridTemplateColumns: "1fr" }}>
                <p>{post.content}</p>
              </div>
              <div className="cr-post-foot" style={{ flexWrap: "wrap", gap: 10 }}>
                <span title="J'aime"><Heart size={14} aria-hidden="true" />{nf.format(post.likes || 0)}</span>
                <span title="Commentaires"><MessageCircle size={14} aria-hidden="true" />{nf.format(post.comments || 0)}</span>
                <span title="Partages"><Repeat2 size={14} aria-hidden="true" />{nf.format(post.shares || 0)}</span>
                <span title="Impressions"><Eye size={14} aria-hidden="true" />{nf.format(post.impressions || 0)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
