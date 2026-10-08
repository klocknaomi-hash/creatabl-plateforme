import { db } from "@/lib/db";
import { aiLogs, posts, users } from "@/lib/db/schema";
import { and, count, eq, gte, inArray, lt, sql } from "drizzle-orm";

type CycleUser = {
  createdAt?: Date | null;
  trialStartedAt?: Date | null;
  trialEndsAt?: Date | null;
  isSubscribed?: boolean | null;
};

// Date d'ancrage du cycle mensuel du compte : fin de l'essai pour un abonné
// (début de la facturation), sinon début de l'essai, sinon date d'inscription.
export function creditCycleAnchor(user?: CycleUser | null): Date | null {
  if (!user) return null;
  if (user.isSubscribed && user.trialEndsAt) return new Date(user.trialEndsAt);
  if (user.trialStartedAt) return new Date(user.trialStartedAt);
  if (user.createdAt) return new Date(user.createdAt);
  return null;
}

function addMonthsClamped(base: Date, months: number, day: number) {
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, lastDay), base.getUTCHours(), base.getUTCMinutes()));
}

// Période de crédits en cours. Sans date d'ancrage : mois civil (renouvellement le 1er).
// Avec ancrage (ex. abonnement commencé le 15 novembre) : du 15 au 15 du mois suivant.
export function currentCreditPeriod(now = new Date(), anchor?: Date | null) {
  if (!anchor || Number.isNaN(anchor.getTime()) || anchor > now) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { start, resetAt };
  }
  const day = anchor.getUTCDate();
  let start = addMonthsClamped(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, anchor.getUTCHours(), anchor.getUTCMinutes())), 0, day);
  if (start > now) {
    start = addMonthsClamped(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, anchor.getUTCHours(), anchor.getUTCMinutes())), -1, day);
  }
  const resetAt = addMonthsClamped(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1, start.getUTCHours(), start.getUTCMinutes())), 1, day);
  return { start, resetAt };
}

// Un crédit = un post programmé ou publié, compté dans la période où il part
// (date de programmation, sinon de publication, sinon de création).
export async function countCreditsUsed(scope: { userId: string; organizationId?: string | null; anchor?: Date | null }) {
  const { start, resetAt } = currentCreditPeriod(new Date(), scope.anchor);
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

// Générations IA de la période, lues dans ai_logs : le compteur repart de zéro à chaque
// renouvellement, sans tâche planifiée.
export async function countAiGenerationsThisMonth(clerkIds: string[], anchor?: Date | null) {
  if (clerkIds.length === 0) return 0;
  const { start } = currentCreditPeriod(new Date(), anchor);
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
