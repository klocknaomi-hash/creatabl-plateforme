import { inngest } from "./client";
import { db } from "@/lib/db";
import { posts, postPlatformResults, socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlatformClient } from "@/lib/platforms";
import { decryptToken } from "@/lib/encryption";

export const createOrEditPost = inngest.createFunction(
  { 
    id: "create-or-edit-post",
    name: "Create or Edit Post",
    triggers: [
      { event: "post/scheduled" as any },
      { event: "post/create-or-edit" as any }
    ] 
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { postId } = event.data;

    // 1. Wait until the scheduled time if provided
    if (event.data.scheduledAt) {
      await step.sleepUntil("wait-for-scheduled-time", event.data.scheduledAt);
    }

    // 2. Fetch the latest post content and platform targets
    const post = await step.run("fetch-post", async () => {
      const p = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: {
          platformResults: true,
        },
      });
      if (!p) throw new Error("Post not found");
      return p;
    });

    const results = [];
    let overallSuccess = true;

    // 3. Publish to each platform target
    for (const res of post.platformResults) {
      if (res.status === "success") {
        results.push({ platform: res.platform, status: "success" });
        continue;
      }

      const publishResult = await step.run(`publish-${res.platform}`, async () => {
        try {
          const account = await db.query.socialAccounts.findFirst({
            where: and(
              eq(socialAccounts.userId, post.userId),
              eq(socialAccounts.platform, res.platform)
            ),
          });

          if (!account) {
            throw new Error(`Social account not connected for ${res.platform}`);
          }

          const client = getPlatformClient(res.platform);
          
          // Decrypt access token for API authentication
          const decryptedAccessToken = account.accessToken ? decryptToken(account.accessToken) : "";
          const fullAccount = { ...account, accessToken: decryptedAccessToken };

          // Publish using platform-specific API (e.g., X API v2 for Twitter)
          const platformPostId = await client.publishPost(
            fullAccount as any,
            post.content,
            (post.mediaUrls as string[]) || []
          );

          // Update platform-specific result in DB
          await db.update(postPlatformResults)
            .set({ 
              status: "success", 
              platformPostId, 
              publishedAt: new Date(),
              errorMessage: null 
            })
            .where(eq(postPlatformResults.id, res.id));

          return { success: true, platformPostId };
        } catch (err: any) {
          console.error(`Failed to post to ${res.platform}:`, err);
          
          await db.update(postPlatformResults)
            .set({ 
              status: "failed", 
              errorMessage: err.message 
            })
            .where(eq(postPlatformResults.id, res.id));

          return { success: false, error: err.message };
        }
      });

      if (!publishResult.success) {
        overallSuccess = false;
      }
      results.push({ platform: res.platform, ...publishResult });
    }

    // 4. Update the final post status
    await step.run("update-post-status", async () => {
      await db.update(posts)
        .set({ 
          status: overallSuccess ? "published" : "failed",
          publishedAt: overallSuccess ? new Date() : null 
        })
        .where(eq(posts.id, postId));
    });

    return { postId, results, overallSuccess };
  }
);

import { commentMonitor } from "./workers/comment-monitor";
import { syncAllMetrics } from "./metrics-syncer";

export const functions = [createOrEditPost, commentMonitor, syncAllMetrics];

