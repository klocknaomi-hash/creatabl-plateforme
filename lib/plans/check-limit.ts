import { db } from "@/lib/db";
import { users, posts, socialAccounts, workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { PLAN_LIMITS, LimitType } from "./limits";
import { isNaomiOrTest } from "./index";

export async function checkPlanLimit(clerkId: string, limitType: LimitType) {
  // Resolve user in DB
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return { allowed: false, current: 0, limit: 0, remaining: 0, message: "User not found" };
  }

  // Naomi or test accounts bypass limits (treated as business / unlimited)
  const isTest = isNaomiOrTest(user.email) || user.email.endsWith('@creatabl-ia.com');
  const plan = isTest ? 'business' : ((user.plan || user.selectedPlan || 'free') as keyof typeof PLAN_LIMITS);
  
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const limitValue = limits[limitType];

  if (limitValue === -1) {
    return { allowed: true, current: 0, limit: -1, remaining: Infinity };
  }

  let currentCount = 0;

  if (limitType === 'postsPerMonth') {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const result = await db.select({ value: count() }).from(posts).where(
      and(
        eq(posts.userId, user.id),
        gte(posts.createdAt, firstDayOfMonth)
      )
    );
    currentCount = Number(result[0].value);
  } else if (limitType === 'connectedAccounts') {
    const result = await db.select({ value: count() }).from(socialAccounts).where(eq(socialAccounts.userId, user.id));
    currentCount = Number(result[0].value);
  } else if (limitType === 'aiGenerations') {
    currentCount = user.monthlyAiCount || 0;
  } else if (limitType === 'teamMembers') {
    // Count workspace members for user's workspace
    const ownerWorkspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.ownerId, user.id)
    });
    if (ownerWorkspace) {
      const result = await db.select({ value: count() }).from(workspaceMembers).where(eq(workspaceMembers.workspaceId, ownerWorkspace.id));
      currentCount = Number(result[0].value);
    } else {
      currentCount = 1;
    }
  } else if (limitType === 'workspaces') {
    const result = await db.select({ value: count() }).from(workspaces).where(eq(workspaces.ownerId, user.id));
    currentCount = Number(result[0].value);
  }

  const allowed = currentCount < limitValue;
  const remaining = Math.max(0, limitValue - currentCount);

  return {
    allowed,
    current: currentCount,
    limit: limitValue,
    remaining,
  };
}
