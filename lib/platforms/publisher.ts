import { db } from "@/lib/db";
import { posts, postPlatformResults, socialAccounts } from "@/lib/db/schema";
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
      // Fetch social account for this user and platform
      const account = await db.query.socialAccounts.findFirst({
        where: and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, result.platform)
        ),
      });

      if (!account) {
        throw new Error(`Social account for ${result.platform} not connected`);
      }

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

      // Update platform result to success
      await db.update(postPlatformResults)
        .set({
          status: "success",
          platformPostId,
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
