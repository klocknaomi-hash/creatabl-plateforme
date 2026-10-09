import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiAgentRuns, aiAgents, postPlatformResults, posts, users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const NETWORK: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", twitter: "X", youtube: "YouTube", tiktok: "TikTok" };

// Notifications de la cloche : exécutions d'agents et publications en échec des 7 derniers jours.
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ items: [] }, { status: 401 });
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return NextResponse.json({ items: [] });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const items: { id: string; title: string; description: string; type: "update" | "alert" | "platform"; at: string; link?: string }[] = [];

  try {
    const runs = await db
      .select({ run: aiAgentRuns, name: aiAgents.name })
      .from(aiAgentRuns)
      .innerJoin(aiAgents, eq(aiAgentRuns.agentId, aiAgents.id))
      .where(and(eq(aiAgentRuns.userId, user.id), gte(aiAgentRuns.startedAt, since)))
      .orderBy(desc(aiAgentRuns.startedAt))
      .limit(10);
    for (const { run, name } of runs) {
      if (run.status === "running") continue;
      const drafts = run.result?.draftIds.length ?? 0;
      const ideas = run.result?.ideas.length ?? 0;
      const auto = run.trigger === "schedule" ? " (lancement automatique)" : "";
      items.push(
        run.status === "succeeded"
          ? {
              id: `run-${run.id}`,
              title: `Agent « ${name} » : ${drafts ? `${drafts} brouillon${drafts > 1 ? "s" : ""} prêt${drafts > 1 ? "s" : ""}` : `${ideas} idée${ideas > 1 ? "s" : ""}`}`,
              description: `Exécution réussie${auto}. Relisez les posts avant de les programmer.`,
              type: "update",
              at: (run.finishedAt ?? run.startedAt).toISOString(),
              link: "/dashboard/agent-ia?onglet=executions",
            }
          : {
              id: `run-${run.id}`,
              title: `Agent « ${name} » : échec`,
              description: run.error || `L'exécution${auto} n'a pas abouti.`,
              type: "alert",
              at: (run.finishedAt ?? run.startedAt).toISOString(),
              link: "/dashboard/agent-ia?onglet=executions",
            }
      );
    }
  } catch {
    // Tables des agents pas encore créées : aucune notification d'agent.
  }

  const failed = await db
    .select({ id: postPlatformResults.id, platform: postPlatformResults.platform, error: postPlatformResults.errorMessage, postId: posts.id, at: posts.scheduledAt, created: posts.createdAt })
    .from(postPlatformResults)
    .innerJoin(posts, eq(postPlatformResults.postId, posts.id))
    .where(and(eq(posts.userId, user.id), eq(postPlatformResults.status, "failed"), gte(posts.createdAt, since)))
    .orderBy(desc(posts.createdAt))
    .limit(5);
  for (const f of failed) {
    items.push({
      id: `fail-${f.id}`,
      title: `Échec de publication sur ${NETWORK[f.platform] ?? f.platform}`,
      description: f.error || "La publication a été refusée par le réseau.",
      type: "platform",
      at: (f.at ?? f.created).toISOString(),
      link: `/dashboard/posts/${f.postId}`,
    });
  }

  items.sort((a, b) => b.at.localeCompare(a.at));
  return NextResponse.json({ items: items.slice(0, 12) });
}
