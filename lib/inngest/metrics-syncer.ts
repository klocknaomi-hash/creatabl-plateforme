import { inngest } from "./client";
import { db } from "@/lib/db";
import { posts, postPlatformResults, socialAccounts } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { getPlatformClient } from "@/lib/platforms";
import { decryptToken } from "@/lib/encryption";

export const syncAllMetrics = inngest.createFunction(
  { 
    id: "sync-all-metrics",
    name: "Sync All Metrics",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }: { step: any }) => {
    const resultsToSync = await step.run("fetch-results-to-sync", async () => {
      return await db.query.postPlatformResults.findMany({
        where: and(
          eq(postPlatformResults.status, "success"),
          isNotNull(postPlatformResults.platformPostId)
        ),
        with: {
          post: true,
        },
      });
    });

    for (const res of resultsToSync) {
      await step.run(`sync-metrics-${res.id}`, async () => {
        try {
          const account = await db.query.socialAccounts.findFirst({
            where: and(
              eq(socialAccounts.userId, res.post.userId),
              eq(socialAccounts.platform, res.platform)
            ),
          });

          if (!account) return;

          const client = getPlatformClient(res.platform);
          const decryptedAccessToken = account.accessToken ? decryptToken(account.accessToken) : "";
          const fullAccount = { ...account, accessToken: decryptedAccessToken };

          const metrics = await client.fetchMetrics(fullAccount as any, res.platformPostId!);

          await db.update(postPlatformResults)
            .set({ 
              likes: metrics.likes,
              comments: metrics.comments,
              shares: metrics.shares,
              reach: metrics.reach,
              impressions: metrics.impressions,
            })
            .where(eq(postPlatformResults.id, res.id));
            
        } catch (err) {
          console.error(`Failed to sync metrics for result ${res.id}:`, err);
        }
      });
    }

    return { syncedCount: resultsToSync.length };
  }
);
