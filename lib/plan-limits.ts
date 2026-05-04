import { db } from "@/lib/db";
import { users, posts, socialAccounts, mediaAssets } from "@/lib/db/schema";
import { eq, count, and, gte } from "drizzle-orm";

export const PLAN_LIMITS = {
  starter: {
    posts: 30,
    ai: 30,
    socialAccounts: 3,
    storageLimit: 100, // 100MB
    analyticsDays: 7,
    recurringPosts: false,
    price: 0,
  },
  pro: {
    posts: 120,
    ai: 120,
    socialAccounts: 15,
    storageLimit: 5120, // 5GB
    analyticsDays: 90,
    recurringPosts: true,
    price: 99,
  },
  business: {
    posts: 500,
    ai: 500,
    socialAccounts: 50,
    storageLimit: 20480, // 20GB
    analyticsDays: 365,
    recurringPosts: true,
    price: 199,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export async function checkPlanLimit(clerkId: string, feature: 'posts' | 'ai' | 'socialAccounts' | 'storageLimit' | 'recurringPosts') {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) return { allowed: false, message: "User not found" };

  const plan = (user.selectedPlan || "starter") as PlanType;
  const limits = PLAN_LIMITS[plan];

  if (feature === 'posts') {
    const total = user.monthlyPostCount || 0;
    return {
      allowed: total < (limits.posts || 0),
      current: total,
      limit: limits.posts,
    };
  }

  if (feature === 'ai') {
    const total = user.monthlyAiCount || 0;
    return {
      allowed: total < (limits.ai || 0),
      current: total,
      limit: limits.ai,
    };
  }

  if (feature === 'socialAccounts') {
    const currentCount = await db.select({ value: count() }).from(socialAccounts).where(eq(socialAccounts.userId, user.id));
    const total = Number(currentCount[0].value);
    return {
      allowed: total < limits.socialAccounts,
      current: total,
      limit: limits.socialAccounts,
    };
  }

  if (feature === 'storageLimit') {
    const assets = await db.query.mediaAssets.findMany({
      where: eq(mediaAssets.userId, user.id),
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
