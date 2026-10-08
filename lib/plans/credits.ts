import { db } from "@/lib/db";
import { aiLogs, posts, users } from "@/lib/db/schema";
import { and, count, eq, gte, inArray, lt, sql } from "drizzle-orm";

// Début du mois courant et du mois suivant (UTC) : les crédits se renouvellent le 1er.
export function currentCreditPeriod(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, resetAt };
}

// Un crédit = un post programmé ou publié, compté dans le mois où il part
// (date de programmation, sinon de publication, sinon de création).
export async function countCreditsUsed(scope: { userId: string; organizationId?: string | null }) {
  const { start, resetAt } = currentCreditPeriod();
  const goesOutAt = sql`coalesce(${posts.scheduledAt}, ${posts.publishedAt}, ${posts.createdAt})`;
  const owner = scope.organizationId
    ? eq(posts.organizationId, scope.organizationId)
    : eq(posts.userId, scope.userId);

  const result = await db
    .select({ value: count() })
    .from(posts)
    .where(
      and(
        owner,
        inArray(posts.status, ["scheduled", "published"]),
        gte(goesOutAt, start),
        lt(goesOutAt, resetAt)
      )
    );
  return Number(result[0]?.value ?? 0);
}

// Générations IA du mois, lues dans ai_logs : le compteur repart de zéro chaque mois
// sans tâche planifiée.
export async function countAiGenerationsThisMonth(clerkIds: string[]) {
  if (clerkIds.length === 0) return 0;
  const { start } = currentCreditPeriod();
  const result = await db
    .select({ value: count() })
    .from(aiLogs)
    .where(and(inArray(aiLogs.userId, clerkIds), gte(aiLogs.createdAt, start)));
  return Number(result[0]?.value ?? 0);
}

// À appeler après chaque génération IA réussie.
export async function recordAiGeneration(
  clerkId: string,
  details: { action: string; provider: string; platform?: string | null; tone?: string | null; tokensUsed?: number | null }
) {
  await db.insert(aiLogs).values({
    userId: clerkId,
    action: details.action,
    provider: details.provider,
    platform: details.platform ?? null,
    tone: details.tone ?? null,
    tokensUsed: details.tokensUsed ?? null,
  });
  // Compteur historique conservé pour les rapports existants.
  await db.update(users)
    .set({ monthlyAiCount: sql`${users.monthlyAiCount} + 1` })
    .where(eq(users.clerkId, clerkId));
}
