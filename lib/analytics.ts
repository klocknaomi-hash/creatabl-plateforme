import { db } from "@/lib/db";
import { posts, postPlatformResults, socialAccounts } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc, inArray } from "drizzle-orm";

export async function getAnalyticsData(userId: string, from?: Date, to?: Date) {
  // 0. Get connected accounts first to filter and ensure we show all connected platforms
  const connectedAccounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, userId));

  const connectedPlatforms = connectedAccounts.map(a => a.platform);
  
  if (connectedPlatforms.length === 0) {
    return {
      connectedPlatforms: [],
      summary: {
        totalPosts: 0,
        totalReach: 0,
        totalImpressions: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagementRate: 0,
      },
      timeSeries: [],
      postsPerDay: [],
      platformDist: [],
      performanceTable: [],
      platformStats: {},
    };
  }

  const whereConditions = [
    eq(posts.userId, userId),
    inArray(postPlatformResults.platform, connectedPlatforms)
  ];
  
  if (from) {
    whereConditions.push(gte(postPlatformResults.publishedAt, from));
  }
  if (to) {
    whereConditions.push(lte(postPlatformResults.publishedAt, to));
  }

  // 1. Summary Metrics for Posts
  const summary = await db
    .select({
      totalPosts: sql<number>`count(distinct ${posts.id})`,
      totalReach: sql<number>`sum(${postPlatformResults.reach})`,
      totalImpressions: sql<number>`sum(${postPlatformResults.impressions})`,
      totalLikes: sql<number>`sum(${postPlatformResults.likes})`,
      totalComments: sql<number>`sum(${postPlatformResults.comments})`,
      totalShares: sql<number>`sum(${postPlatformResults.shares})`,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(...whereConditions));


  const stats = summary[0] || {
    totalPosts: 0,
    totalReach: 0,
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
  };


  const totalEngagement = Number(stats.totalLikes) + Number(stats.totalComments) + Number(stats.totalShares);
  const avgEngagementRate = Number(stats.totalImpressions) > 0 
    ? (totalEngagement / Number(stats.totalImpressions)) * 100 
    : 0;

  // 2. Line Chart: Reach & Impressions over time
  const timeSeries = await db
    .select({
      date: sql<string>`DATE(${postPlatformResults.publishedAt})`,
      platform: postPlatformResults.platform,
      reach: sql<number>`sum(${postPlatformResults.reach})`,
      impressions: sql<number>`sum(${postPlatformResults.impressions})`,
      likes: sql<number>`sum(${postPlatformResults.likes})`,
      comments: sql<number>`sum(${postPlatformResults.comments})`,
      shares: sql<number>`sum(${postPlatformResults.shares})`,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(...whereConditions))
    .groupBy(sql`DATE(${postPlatformResults.publishedAt})`, postPlatformResults.platform)
    .orderBy(sql`DATE(${postPlatformResults.publishedAt})`);

  // 3. Bar Chart: Posts per day
  const postsPerDay = await db
    .select({
      date: sql<string>`DATE(${postPlatformResults.publishedAt})`,
      count: sql<number>`count(distinct ${posts.id})`,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(...whereConditions))
    .groupBy(sql`DATE(${postPlatformResults.publishedAt})`)
    .orderBy(sql`DATE(${postPlatformResults.publishedAt})`);

  // 4. Donut Chart: Platform distribution
  const platformDist = await db
    .select({
      platform: postPlatformResults.platform,
      count: sql<number>`count(*)`,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(...whereConditions))
    .groupBy(postPlatformResults.platform);

  // 5. Platform-specific Stats for summary cards
  const platformStatsQuery = await db
    .select({
      platform: postPlatformResults.platform,
      reach: sql<number>`sum(${postPlatformResults.reach})`,
      impressions: sql<number>`sum(${postPlatformResults.impressions})`,
      likes: sql<number>`sum(${postPlatformResults.likes})`,
      comments: sql<number>`sum(${postPlatformResults.comments})`,
      shares: sql<number>`sum(${postPlatformResults.shares})`,
      posts: sql<number>`count(distinct ${posts.id})`,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(...whereConditions))
    .groupBy(postPlatformResults.platform);

  // Map to object for easy access
  const platformStats: Record<string, {
    platform: string;
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    posts: number;
    engagement: number;
  }> = {};
  connectedPlatforms.forEach(p => {
    const pData = platformStatsQuery.find(d => d.platform === p);
    platformStats[p] = pData ? {
      ...pData,
      engagement: Number(pData.likes) + Number(pData.comments) + Number(pData.shares)
    } : {
      platform: p,
      reach: 0,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      posts: 0,
      engagement: 0
    };
  });

  // 6. Post Performance Table
  const performanceTable = await db
    .select({
      id: posts.id,
      platform: postPlatformResults.platform,
      content: posts.content,
      publishedAt: postPlatformResults.publishedAt,
      likes: postPlatformResults.likes,
      comments: postPlatformResults.comments,
      shares: postPlatformResults.shares,
      reach: postPlatformResults.reach,
      impressions: postPlatformResults.impressions,
    })
    .from(posts)
    .innerJoin(postPlatformResults, eq(posts.id, postPlatformResults.postId))
    .where(and(...whereConditions))
    .orderBy(desc(postPlatformResults.publishedAt))
    .limit(50);

  return {
    connectedPlatforms,
    summary: {
      ...stats,
      avgEngagementRate,
    },
    timeSeries,
    postsPerDay,
    platformDist,
    performanceTable,
    platformStats,
  };
}

