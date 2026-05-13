import { db } from "@/lib/db";
import { users, posts, postPlatformResults, socialAccounts, userSettings } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getAnalyticsData } from "@/lib/analytics";
import { subDays, format } from "date-fns";

export async function getDashboardData(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return null;
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
  } catch (error) {
    console.error('getDashboardData error:', error);
    return null;
  }
}

export async function getDashboardStats(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return { 
      totalPosts: 0, totalReach: 0, totalImpressions: 0, 
      totalLikes: 0, totalComments: 0, totalShares: 0,
      avgEngagementRate: 0, totalDrafts: 0, upcomingCount: 0
    };

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
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return { 
      totalPosts: 0, totalReach: 0, totalImpressions: 0, 
      totalLikes: 0, totalComments: 0, totalShares: 0,
      avgEngagementRate: 0, totalDrafts: 0, upcomingCount: 0
    };
  }
}

export async function getUpcomingPosts(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (!user) return [];

    return await db.query.posts.findMany({
      where: and(eq(posts.userId, user.id), eq(posts.status, "scheduled")),
      orderBy: [posts.scheduledAt],
      limit: 5,
    });
  } catch (error) {
    console.error('getUpcomingPosts error:', error);
    return [];
  }
}

export async function getRecentDrafts(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (!user) return [];

    return await db.query.posts.findMany({
      where: and(eq(posts.userId, user.id), eq(posts.status, "draft")),
      orderBy: [desc(posts.createdAt)],
      limit: 3,
    });
  } catch (error) {
    console.error('getRecentDrafts error:', error);
    return [];
  }
}

export async function getTopContent(userId: string) {
  try {
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
  } catch (error) {
    console.error('getTopContent error:', error);
    return [];
  }
}

export async function getEngagementData(userId: string) {
  try {
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
  } catch (error) {
    console.error('getEngagementData error:', error);
    return [];
  }
}

export async function getCachedUserSettings(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return null;

    return await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, user.id),
    });
  } catch (error) {
    console.error('getCachedUserSettings error:', error);
    return null;
  }
}

export async function getCachedAccounts(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return [];

    return await db.query.socialAccounts.findMany({
      where: eq(socialAccounts.userId, user.id),
    });
  } catch (error) {
    console.error('getCachedAccounts error:', error);
    return [];
  }
}
