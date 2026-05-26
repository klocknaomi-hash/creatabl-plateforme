import { db } from "@/lib/db";
import { posts, postPlatformResults, socialAccounts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlatformClient } from "@/lib/platforms";
import { decryptToken } from "@/lib/encryption";

export async function publishPostImmediately(postId: string, userId: string) {
  // 1. Fetch platform result rows
  let platformResults = await db.query.postPlatformResults.findMany({
    where: eq(postPlatformResults.postId, postId),
  });

  // If no platform results exist yet, create them based on the post's target platforms
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const postPlatforms = (post.platforms as string[]) || [];

  if (platformResults.length === 0 && postPlatforms.length > 0) {
    const createdResults = [];
    for (const platform of postPlatforms) {
      const [res] = await db.insert(postPlatformResults).values({
        postId,
        platform: platform as any,
        status: "pending",
      }).returning();
      createdResults.push(res);
    }
    platformResults = createdResults;
  }

  let overallSuccess = true;
  let overallFailure = false;

  for (const result of platformResults) {
    if (result.status === "success") continue;

    try {
      // Fetch all social accounts for this user and platform
      const allAccounts = await db.query.socialAccounts.findMany({
        where: and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, result.platform)
        ),
      });

      if (allAccounts.length === 0) {
        throw new Error(`Social account for ${result.platform} not connected`);
      }

      // Check user plan to determine active limits
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check trial status
      const { getTrialStatus } = await import('@/lib/trial');
      const trialStatus = getTrialStatus({
        trialStartedAt: user.trialStartedAt,
        trialEndsAt: user.trialEndsAt,
        isSubscribed: user.isSubscribed || false,
        email: user.email,
      });

      const isTrialActive = trialStatus.status === 'trial';
      const plan = isTrialActive 
        ? 'business' 
        : ((user.plan || user.selectedPlan || 'starter') as string);
      
      const maxAccounts = (plan === 'business' || plan === 'agency') ? 2 : 1;

      // Filter only active accounts
      const activeAccounts = allAccounts.slice(0, maxAccounts);

      if (activeAccounts.length === 0) {
        throw new Error(`No active social accounts for ${result.platform} on your current plan`);
      }

      let lastPlatformPostId = "";
      
      // Publish to all active accounts!
      for (const account of activeAccounts) {
        // Decrypt tokens
        const decryptedAccount = {
          ...account,
          accessToken: account.accessToken ? decryptToken(account.accessToken) : null,
          refreshToken: account.refreshToken ? decryptToken(account.refreshToken) : null,
        };

        const client = getPlatformClient(result.platform);

        // Publish content and media to the specific platform
        const platformPostId = await client.publishPost(
          decryptedAccount as any,
          post.content || "",
          (post.mediaUrls as string[]) || []
        );
        
        lastPlatformPostId = platformPostId;
      }

      // Update platform result to success
      await db.update(postPlatformResults)
        .set({
          status: "success",
          platformPostId: lastPlatformPostId,
          publishedAt: new Date(),
          errorMessage: null,
        })
        .where(eq(postPlatformResults.id, result.id));

      console.log(`Successfully published post ${postId} to ${result.platform}`);
    } catch (error: any) {
      console.error(`Failed to publish post ${postId} to ${result.platform}:`, error.message);
      overallSuccess = false;
      overallFailure = true;

      await db.update(postPlatformResults)
        .set({
          status: "failed",
          errorMessage: error.message,
        })
        .where(eq(postPlatformResults.id, result.id));
    }
  }

  // Update main post status in db based on results
  await db.update(posts)
    .set({
      status: overallSuccess ? "published" : overallFailure ? "failed" : "published",
      publishedAt: overallSuccess ? new Date() : null,
    })
    .where(eq(posts.id, postId));
}
