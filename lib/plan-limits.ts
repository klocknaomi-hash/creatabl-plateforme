import { db } from "@/lib/db";
import { users, posts, socialAccounts, autoReplyRules } from "@/lib/db/schema";
import { eq, count, and, gte } from "drizzle-orm";

export const PLAN_LIMITS = {
  free: {
    socialAccounts: 3,
    postsPerMonth: 30,
    autoReplyRules: 0,
    recurringPosts: false,
    analyticsDays: 7,
    storageLimit: 100, // 100MB
  },
  pro: {
    socialAccounts: 15,
    postsPerMonth: 500,
    autoReplyRules: 20,
    recurringPosts: true,
    analyticsDays: 90,
    storageLimit: 5120, // 5GB
  },
  agency: {
    socialAccounts: 50,
    postsPerMonth: 2000,
    autoReplyRules: 100,
    recurringPosts: true,
    analyticsDays: 365,
    storageLimit: 20480, // 20GB
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export async function checkPlanLimit(clerkId: string, feature: keyof typeof PLAN_LIMITS['free']) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) return { allowed: false, message: "User not found" };

  const plan = user.plan as PlanType;
  const limits = PLAN_LIMITS[plan];

  if (feature === 'socialAccounts') {
    const currentCount = await db.select({ value: count() }).from(socialAccounts).where(eq(socialAccounts.userId, user.id));
    const total = currentCount[0].value;
    return {
      allowed: total < limits.socialAccounts,
      current: total,
      limit: limits.socialAccounts,
    };
  }

  if (feature === 'postsPerMonth') {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const currentCount = await db.select({ value: count() }).from(posts).where(
      and(
        eq(posts.userId, user.id),
        gte(posts.createdAt, firstDayOfMonth)
      )
    );
    const total = currentCount[0].value;
    return {
      allowed: total < limits.postsPerMonth,
      current: total,
      limit: limits.postsPerMonth,
    };
  }

  if (feature === 'autoReplyRules') {
    const currentCount = await db.select({ value: count() }).from(autoReplyRules).where(eq(autoReplyRules.userId, user.id));
    const total = currentCount[0].value;
    return {
      allowed: total < limits.autoReplyRules,
      current: total,
      limit: limits.autoReplyRules,
    };
  }

  if (feature === 'storageLimit') {
    const assets = await db.query.mediaAssets.findMany({
      where: eq(users.id, user.id),
    });
    const totalBytes = assets.reduce((acc, asset) => acc + parseInt(asset.size || "0"), 0);
    const totalMB = totalBytes / (1024 * 1024);
    
    return {
      allowed: totalMB < limits.storageLimit,
      current: totalMB,
      limit: limits.storageLimit,
    };
  }

  if (feature === 'recurringPosts') {
    return {
      allowed: limits.recurringPosts,
    };
  }

  return { allowed: true };
}
