import { Job } from 'bullmq';
import { db } from '@/lib/db';
import { posts, postPlatformResults, socialAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getPlatformClient } from '@/lib/platforms';
import { decryptToken } from '@/lib/encryption';
import { PostPublisherJobData } from './post-publisher';

export const processPostPublisherJob = async (job: Job<PostPublisherJobData>) => {
  const { postId } = job.data;
  console.log(`Processing post publication for post ID: ${postId}`);

  // 1. Fetch post with its platform list
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) {
    console.error(`Post not found: ${postId}`);
    return;
  }

  // 2. Fetch platform result rows
  const platformResults = await db.query.postPlatformResults.findMany({
    where: eq(postPlatformResults.postId, postId),
  });

  let overallSuccess = true;
  let overallFailure = false;

  for (const result of platformResults) {
    if (result.status === 'success') continue;

    try {
      // Fetch social account for this user and platform
      const account = await db.query.socialAccounts.findFirst({
        where: and(
          eq(socialAccounts.userId, post.userId),
          eq(socialAccounts.platform, result.platform)
        ),
      });

      if (!account) {
        throw new Error(`Social account for ${result.platform} not found`);
      }

      // Decrypt tokens
      const decryptedAccount = {
        ...account,
        accessToken: account.accessToken ? decryptToken(account.accessToken) : null,
        refreshToken: account.refreshToken ? decryptToken(account.refreshToken) : null,
      };

      const client = getPlatformClient(result.platform);
      
      // Publish
      const platformPostId = await client.publishPost(
        decryptedAccount as any, 
        post.content, 
        (post.mediaUrls as string[]) || []
      );

      // Update success
      await db.update(postPlatformResults)
        .set({
          status: 'success',
          platformPostId,
          publishedAt: new Date(),
        })
        .where(eq(postPlatformResults.id, result.id));

      console.log(`Successfully published post ${postId} to ${result.platform}`);
    } catch (error: any) {
      console.error(`Failed to publish post ${postId} to ${result.platform}:`, error.message);
      overallSuccess = false;
      overallFailure = true;

      await db.update(postPlatformResults)
        .set({
          status: 'failed',
          errorMessage: error.message,
        })
        .where(eq(postPlatformResults.id, result.id));
    }
  }

  // 3. Update main post status
  await db.update(posts)
    .set({
      status: overallSuccess ? 'published' : overallFailure ? 'failed' : 'published',
      publishedAt: overallSuccess ? new Date() : null,
    })
    .where(eq(posts.id, postId));
};
