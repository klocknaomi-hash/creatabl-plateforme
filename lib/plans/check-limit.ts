import { db } from "@/lib/db";
import { users, socialAccounts } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { PLAN_LIMITS, LimitType, normalizePlan } from "./limits";
import { countAiGenerationsThisMonth, countCreditsUsed, creditCycleAnchor, currentCreditPeriod } from "./credits";
import { isNaomiOrTest } from "./index";
import { clerkClient } from "@clerk/nextjs/server";

export async function checkPlanLimit(
  clerkId: string,
  limitType: LimitType,
  organizationId?: string | null
) {
  // Resolve targetClerkId (either personal user or owner/creator of organization)
  let targetClerkId = clerkId;
  let memberClerkIds: string[] = [clerkId];
  let currentTeamCount = 1;

  if (organizationId) {
    try {
      const client = await clerkClient();
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId,
      });

      if (memberships && memberships.data.length > 0) {
        // Collect all member Clerk IDs for counting total AI generations
        memberClerkIds = memberships.data
          .map((m) => m.publicUserData?.userId)
          .filter((id): id is string => !!id);
        
        currentTeamCount = memberships.data.length;

        // Sort by creation date to find the creator/owner
        const sorted = [...memberships.data].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Infinity;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Infinity;
          return timeA - timeB;
        });
        const ownerId = sorted[0]?.publicUserData?.userId;
        if (ownerId) {
          targetClerkId = ownerId;
        }
      }
    } catch (err) {
      console.error("[checkPlanLimit] Error resolving organization memberships from Clerk:", err);
    }
  }

  // Resolve user in DB using targetClerkId
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, targetClerkId),
  });

  if (!user) {
    return { allowed: false, current: 0, limit: 0, remaining: 0, message: "User not found" };
  }

  // Naomi or test accounts bypass limits (treated as business / unlimited)
  const isTest = isNaomiOrTest(user.email) || user.email.endsWith('@creatabl-ia.com');
  const plan = isTest ? 'business' : normalizePlan(user.plan || user.selectedPlan);
  const limits = PLAN_LIMITS[plan];
  const limitValue = limits[limitType];
  const anchor = creditCycleAnchor(user);
  const period = currentCreditPeriod(new Date(), anchor);

  if (limitValue === -1) {
    return { allowed: true, current: 0, limit: -1, remaining: Infinity, plan, period };
  }

  let currentCount = 0;

  if (limitType === 'postsPerMonth') {
    currentCount = await countCreditsUsed({ userId: user.id, organizationId, anchor });

  } else if (limitType === 'connectedAccounts') {
    const accountQuery = organizationId
      ? eq(socialAccounts.organizationId, organizationId)
      : eq(socialAccounts.userId, user.id);

    const result = await db
      .select({ value: count() })
      .from(socialAccounts)
      .where(accountQuery);
    currentCount = Number(result[0].value);

  } else if (limitType === 'aiGenerations') {
    // Toute l'organisation partage le même compteur ; il repart de zéro chaque mois.
    const clerkIds = organizationId && memberClerkIds.length > 0 ? memberClerkIds : [targetClerkId];
    currentCount = await countAiGenerationsThisMonth(clerkIds, anchor);

  } else if (limitType === 'teamMembers') {
    // Count team members using the organization membership count from Clerk
    currentCount = currentTeamCount;
  } else if (limitType === 'storageLimit') {
    const { mediaAssets } = await import("@/lib/db/schema");
    const assets = await db.query.mediaAssets.findMany({
      where: organizationId
        ? eq(mediaAssets.organizationId, organizationId)
        : eq(mediaAssets.userId, user.id),
    });
    const totalBytes = assets.reduce((acc, asset) => acc + parseInt(asset.size || "0"), 0);
    currentCount = totalBytes / (1024 * 1024); // Convert to MB
  }

  const allowed = currentCount < limitValue;
  const remaining = Math.max(0, limitValue - currentCount);

  return {
    allowed,
    current: currentCount,
    limit: limitValue,
    remaining,
    plan,
    period,
  };
}
