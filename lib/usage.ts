import { db } from "@/lib/db";
import { users, posts, socialAccounts, autoReplyRules } from "@/lib/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { PLAN_LIMITS, PlanType } from "./plan-limits";

export async function getUsage(clerkId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) throw new Error("User not found");

  const plan = user.plan as PlanType;
  const limits = PLAN_LIMITS[plan];

  // Social Accounts count
  const accountsCount = await db.select({ value: count() }).from(socialAccounts).where(eq(socialAccounts.userId, user.id));
  
  // Posts this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const postsCount = await db.select({ value: count() }).from(posts).where(
    and(
      eq(posts.userId, user.id),
      gte(posts.createdAt, firstDayOfMonth)
    )
  );

  // Auto Reply Rules
  const rulesCount = await db.select({ value: count() }).from(autoReplyRules).where(eq(autoReplyRules.userId, user.id));

  return {
    plan,
    limits,
    usage: {
      socialAccounts: accountsCount[0].value,
      postsPerMonth: postsCount[0].value,
      autoReplyRules: rulesCount[0].value,
    }
  };
}
