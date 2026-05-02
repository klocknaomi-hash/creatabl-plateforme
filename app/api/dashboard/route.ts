import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, posts, postPlatformResults, socialAccounts, userSettings } from "@/lib/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { getAnalyticsData } from "@/lib/analytics";
import { subDays } from "date-fns";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 1. Get Analytics Summary & Performance
  const analytics = await getAnalyticsData(user.id, subDays(new Date(), 30));

  // 2. Get Upcoming Posts (Scheduled)
  const upcomingPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.userId, user.id),
      eq(posts.status, "scheduled")
    ),
    orderBy: [posts.scheduledAt],
    limit: 5,
  });

  // 3. Get Top Performing Posts (by impressions/reach)
  const topPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      platform: postPlatformResults.platform,
      reach: postPlatformResults.reach,
      impressions: postPlatformResults.impressions,
      likes: postPlatformResults.likes,
      comments: postPlatformResults.comments,
      shares: postPlatformResults.shares,
      status: posts.status,
      publishedAt: postPlatformResults.publishedAt,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(
      eq(posts.userId, user.id),
      eq(posts.status, "published")
    ))
    .orderBy(desc(postPlatformResults.impressions))
    .limit(4);

  // 4. Get Recent Drafts
  const recentDrafts = await db.query.posts.findMany({
    where: and(
      eq(posts.userId, user.id),
      eq(posts.status, "draft")
    ),
    orderBy: [desc(posts.createdAt)],
    limit: 3,
  });

  // 5. Get Total Drafts Count
  const draftsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(and(
      eq(posts.userId, user.id),
      eq(posts.status, "draft")
    ));

  // 6. Get Connected Accounts
  const accounts = await db.query.socialAccounts.findMany({
    where: eq(socialAccounts.userId, user.id),
  });

  // 7. Get User Settings
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id),
  });

  return NextResponse.json({
    summary: {
      ...analytics.summary,
      totalDrafts: Number(draftsCount[0]?.count || 0),
    },
    timeSeries: analytics.timeSeries,
    upcomingPosts,
    topPosts,
    recentDrafts,
    platformStats: analytics.platformStats,
    accounts,
    settings,
  });
}
