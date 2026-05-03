import { db } from "@/lib/db";
import { users, posts, postPlatformResults, socialAccounts, userSettings } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getAnalyticsData } from "@/lib/analytics";
import { subDays, format } from "date-fns";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

export async function getDashboardData(userId: string) {
  // Use cache for the core data fetching if needed, 
  // but for a dashboard, we usually want fresh data or very short-lived cache.
  // However, we can use 'use cache' for specific sub-functions.

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [
    analytics,
    upcomingPosts,
    topPosts,
    recentDrafts,
    draftsCount,
    accounts,
    settings
  ] = await Promise.all([
    getAnalyticsData(user.id, subDays(new Date(), 30)),
    db.query.posts.findMany({
      where: and(
        eq(posts.userId, user.id),
        eq(posts.status, "scheduled")
      ),
      orderBy: [posts.scheduledAt],
      limit: 5,
    }),
    db
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
      .limit(4),
    db.query.posts.findMany({
      where: and(
        eq(posts.userId, user.id),
        eq(posts.status, "draft")
      ),
      orderBy: [desc(posts.createdAt)],
      limit: 3,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(and(
        eq(posts.userId, user.id),
        eq(posts.status, "draft")
      )),
    db.query.socialAccounts.findMany({
      where: eq(socialAccounts.userId, user.id),
    }),
    db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id),
    })
  ]);

  return {
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
    user,
  };
}

export async function getDashboardStats(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) throw new Error("User not found");

  const [analytics, draftsCount, upcomingCount] = await Promise.all([
    getAnalyticsData(user.id, subDays(new Date(), 30)),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(and(eq(posts.userId, user.id), eq(posts.status, "draft"))),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(and(eq(posts.userId, user.id), eq(posts.status, "scheduled"))),
  ]);

  return {
    ...analytics.summary,
    totalDrafts: Number(draftsCount[0]?.count || 0),
    upcomingCount: Number(upcomingCount[0]?.count || 0),
  };
}

export async function getUpcomingPosts(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return [];

  return await db.query.posts.findMany({
    where: and(eq(posts.userId, user.id), eq(posts.status, "scheduled")),
    orderBy: [posts.scheduledAt],
    limit: 5,
  });
}

export async function getRecentDrafts(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return [];

  return await db.query.posts.findMany({
    where: and(eq(posts.userId, user.id), eq(posts.status, "draft")),
    orderBy: [desc(posts.createdAt)],
    limit: 3,
  });
}

export async function getTopContent(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return [];

  return await db
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
    .where(and(eq(posts.userId, user.id), eq(posts.status, "published")))
    .orderBy(desc(postPlatformResults.impressions))
    .limit(4);
}

export async function getEngagementData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return [];

  const analytics = await getAnalyticsData(user.id, subDays(new Date(), 30));
  
  return (analytics.timeSeries || []).reduce((acc: any[], curr: any) => {
    const dateStr = format(new Date(curr.date), "MMM d");
    let existing = acc.find(a => a.date === dateStr);
    
    if (!existing) {
      existing = { date: dateStr, likes: 0, comments: 0, shares: 0, impressions: 0 };
      acc.push(existing);
    }
    
    existing.likes += Number(curr.likes || 0);
    existing.comments += Number(curr.comments || 0);
    existing.shares += Number(curr.shares || 0);
    existing.impressions += Number(curr.impressions || 0);
    
    return acc;
  }, []).map((day: any) => ({
    date: day.date,
    engagement: day.impressions > 0 
      ? parseFloat(((day.likes + day.comments + day.shares) / day.impressions * 100).toFixed(1))
      : 0
  })).slice(-7);
}

// Example of using 'use cache' for semi-static data
export async function getCachedUserSettings(userId: string) {
  'use cache';
  cacheLife('minutes'); // Cache for a few minutes
  
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) return null;

  return await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id),
  });
}

export async function getCachedAccounts(userId: string) {
  'use cache';
  cacheLife('minutes');
  
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) return [];

  return await db.query.socialAccounts.findMany({
    where: eq(socialAccounts.userId, user.id),
  });
}

