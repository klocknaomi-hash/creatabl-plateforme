import { pgTable, text, timestamp, uuid, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'pro', 'agency']);
export const platformEnum = pgEnum('platform', ['instagram', 'youtube', 'tiktok', 'facebook', 'linkedin', 'pinterest', 'discord', 'twitter', 'slack']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published', 'failed']);
export const platformResultStatusEnum = pgEnum('platform_result_status', ['pending', 'success', 'failed']);
export const triggerTypeEnum = pgEnum('trigger_type', ['keyword', 'sentiment', 'all']);
export const approvalModeEnum = pgEnum('approval_mode', ['auto', 'manual']);
export const replyStatusEnum = pgEnum('reply_status', ['pending', 'approved', 'rejected', 'posted']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  plan: planEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const socialAccounts = pgTable('social_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  platform: platformEnum('platform').notNull(),
  platformUserId: text('platform_user_id'),
  accessToken: text('access_token'), // Encrypted
  refreshToken: text('refresh_token'), // Encrypted
  expiresAt: timestamp('expires_at'),
  username: text('username'),
  avatarUrl: text('avatar_url'),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  mediaUrls: jsonb('media_urls'),
  platforms: jsonb('platforms'),
  status: postStatusEnum('status').default('draft').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postPlatformResults = pgTable('post_platform_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  platform: platformEnum('platform').notNull(),
  platformPostId: text('platform_post_id'),
  status: platformResultStatusEnum('status').default('pending').notNull(),
  errorMessage: text('error_message'),
  publishedAt: timestamp('published_at'),
});

export const autoReplyRules = pgTable('auto_reply_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  socialAccountId: uuid('social_account_id').references(() => socialAccounts.id).notNull(),
  triggerType: triggerTypeEnum('trigger_type').notNull(),
  keywords: jsonb('keywords'),
  tone: text('tone').notNull(),
  approvalMode: approvalModeEnum('approval_mode').default('manual').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const replyQueue = pgTable('reply_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleId: uuid('rule_id').references(() => autoReplyRules.id).notNull(),
  commentId: text('comment_id').notNull(),
  commentText: text('comment_text').notNull(),
  generatedReply: text('generated_reply').notNull(),
  status: replyStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
