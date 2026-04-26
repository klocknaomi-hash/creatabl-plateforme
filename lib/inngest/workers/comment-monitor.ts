import { inngest } from "../client";
import { db } from "@/lib/db";
import { autoReplyRules, autoReplyLogs, socialAccounts, posts, postPlatformResults, userSettings } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getPlatformClient } from "@/lib/platforms";
import { decryptToken } from "@/lib/encryption";
import { geminiModel } from "@/lib/gemini/client";

export const commentMonitor = inngest.createFunction(
  { 
    id: "comment-monitor",
    name: "Comment Monitor",
    triggers: [
      { cron: "*/15 * * * *" },
      { event: "comment/monitor.trigger" }
    ]
  },
  async ({ step }) => {
    // 1. Fetch all active social accounts
    const accounts = await step.run("fetch-accounts", async () => {
      return await db.query.socialAccounts.findMany();
    });

    for (const account of accounts) {
      await step.run(`process-account-${account.id}`, async () => {
        // 1b. Check global auto-reply setting
        const userSettingsRecord = await db.query.userSettings.findFirst({
          where: eq(userSettings.userId, account.userId)
        });
        
        if (userSettingsRecord && !userSettingsRecord.enableAutoReplies) {
          return;
        }

        // 2. Fetch active rules for this account
        const rules = await db.query.autoReplyRules.findMany({
          where: and(
            eq(autoReplyRules.socialAccountId, account.id),
            eq(autoReplyRules.isActive, true)
          )
        });

        if (rules.length === 0) return;

        const client = getPlatformClient(account.platform);
        const decryptedAccessToken = account.accessToken ? decryptToken(account.accessToken) : "";
        const fullAccount = { ...account, accessToken: decryptedAccessToken };

        // 3. Fetch recent comments
        // Note: In a real app, we'd need to track last_checked_at or similar
        // For this implementation, we'll assume fetchComments handles basic "recent" fetching
        // or we iterate through recent posts.
        // For simplicity, let's assume we fetch comments for the user's recent posts.
        
        // This is a simplification. Ideally the platform client would have a 'fetchAllRecentComments'
        const recentPosts = await db.query.posts.findMany({
          where: eq(posts.userId, account.userId),
          limit: 10,
          orderBy: (posts, { desc }) => [desc(posts.createdAt)]
        });

        for (const post of recentPosts) {
          // We need the platform-specific post ID
          const platformResult = await db.query.postPlatformResults.findFirst({
            where: and(
              eq(postPlatformResults.postId, post.id),
              eq(postPlatformResults.platform, account.platform),
              eq(postPlatformResults.status, "success")
            )
          });

          if (!platformResult?.platformPostId) continue;

          const comments = await client.fetchComments(fullAccount as any, platformResult.platformPostId);

          for (const comment of comments) {
            // Check if we already replied to this comment
            const existingLog = await db.query.autoReplyLogs.findFirst({
              where: eq(autoReplyLogs.commentId, comment.id)
            });

            if (existingLog) continue;

            // Find matching rule
            const matchingRule = rules.find(rule => {
              if (rule.triggerType === "all") return true;
              if (rule.triggerType === "keyword" && rule.keywords) {
                const keywords = rule.keywords as string[];
                return keywords.some(k => comment.text.toLowerCase().includes(k.toLowerCase()));
              }
              return false;
            });

            if (matchingRule) {
              let replyText = matchingRule.replyTemplate || "";

              if (matchingRule.useAi) {
                const prompt = `
                  You are an AI assistant replying to comments on ${account.platform}.
                  User Comment: "${comment.text}"
                  Context/Instructions: ${matchingRule.aiContext || "Be helpful and friendly."}
                  Tone: ${matchingRule.tone}
                  
                  Generate a short, engaging reply.
                `;
                const result = await geminiModel.generateContent(prompt);
                replyText = result.response.text();
              }

              if (replyText) {
                await client.postReply(fullAccount as any, comment.id, replyText);

                // Log the reply
                await db.insert(autoReplyLogs).values({
                  userId: account.userId,
                  ruleId: matchingRule.id,
                  platform: account.platform,
                  commentId: comment.id,
                  commentText: comment.text,
                  replyText: replyText,
                  isAi: matchingRule.useAi
                });
              }
            }
          }
        }
      });
    }
  }
);
