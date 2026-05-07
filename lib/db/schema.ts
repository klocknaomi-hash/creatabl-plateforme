import { pgTable, text, timestamp, uuid, jsonb, boolean, pgEnum, integer } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'starter', 'pro', 'agency', 'business']);
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
  plan: text('plan').default('starter'),
  billingCycle: text('billing_cycle').default('monthly'),
  monthlyAiCount: integer("monthly_ai_count").default(0),
  monthlyPostCount: integer("monthly_post_count").default(0),
  selectedPlan: text("selected_plan").default("starter"),
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  stripeCustomerId: text('stripe_customer_id'),
  stripePriceId: text('stripe_price_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').default('trialing'),
  isSubscribed: boolean("is_subscribed").default(false),
  paddleCustomerId: text("paddle_customer_id"), // Deprecated in favor of Stripe
  profileType: text("profile_type"),
  clientType: text('client_type'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  maxWorkspaces: integer("max_workspaces").default(1).notNull(),
  canvaAccessToken: text('canva_access_token'),
  canvaRefreshToken: text('canva_refresh_token'),
  canvaTokenExpiresAt: timestamp('canva_token_expires_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiUsage = pgTable('ai_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  requestCount: integer('request_count').default(0).notNull(),
  windowStart: timestamp('window_start').defaultNow().notNull(),
  cooldownUntil: timestamp('cooldown_until'),
  lastRequestAt: timestamp('last_request_at').defaultNow(),
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
  likes: integer('likes').default(0).notNull(),
  comments: integer('comments').default(0).notNull(),
  shares: integer('shares').default(0).notNull(),
  reach: integer('reach').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
});

export const autoReplyRules = pgTable('auto_reply_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  socialAccountId: uuid('social_account_id').references(() => socialAccounts.id).notNull(),
  triggerType: triggerTypeEnum('trigger_type').notNull(),
  keywords: jsonb('keywords'),
  replyTemplate: text('reply_template'),
  useAi: boolean('use_ai').default(false).notNull(),
  aiContext: text('ai_context'),
  tone: text('tone').notNull(),
  approvalMode: approvalModeEnum('approval_mode').default('manual').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const autoReplyLogs = pgTable('auto_reply_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  ruleId: uuid('rule_id').references(() => autoReplyRules.id).notNull(),
  platform: platformEnum('platform').notNull(),
  commentId: text('comment_id').notNull(),
  commentText: text('comment_text').notNull(),
  replyText: text('reply_text').notNull(),
  isAi: boolean('is_ai').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  url: text('url').notNull(),
  fileId: text('file_id').unique().notNull(),
  name: text('name').notNull(),
  size: text('size'),
  mimeType: text('mime_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export const aiLogs = pgTable("ai_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  platform: text("platform"),
  tone: text("tone"),
  provider: text("provider").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),

  // Notification Settings
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  notificationFrequency: text('notification_frequency').default('real-time').notNull(), // real-time, daily, weekly
  notifyNewComments: boolean('notify_new_comments').default(true).notNull(),
  notifyNewFollowers: boolean('notify_new_followers').default(true).notNull(),
  notifyPostPerformance: boolean('notify_post_performance').default(true).notNull(),
  notifyScheduledPosts: boolean('notify_scheduled_posts').default(true).notNull(),

  // Content & Posting
  timezone: text('timezone').default('UTC').notNull(),
  defaultPostingTimes: jsonb('default_posting_times').default({}).notNull(),
  autoSaveFrequency: integer('auto_save_frequency').default(30).notNull(), // seconds
  enableAutoReplies: boolean('enable_auto_replies').default(true).notNull(),

  // Integration Settings
  apiKeys: jsonb('api_keys').default({}).notNull(),
  webhookSettings: jsonb('webhook_settings').default({}).notNull(),

  // Analytics & Data
  analyticsReportFrequency: text('analytics_report_frequency').default('weekly').notNull(), // weekly, monthly
  privacySettings: jsonb('privacy_settings').default({}).notNull(),

  // Workspace
  workspaceName: text('workspace_name'),
  workspaceBranding: jsonb('workspace_branding').default({}).notNull(),
  language: text('language').default('en').notNull(),
  locale: text('locale').default('en-US').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  socialAccounts: many(socialAccounts),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  platformResults: many(postPlatformResults),
}));

export const postPlatformResultsRelations = relations(postPlatformResults, ({ one }) => ({
  post: one(posts, {
    fields: [postPlatformResults.postId],
    references: [posts.id],
  }),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
}));

export const autoReplyRulesRelations = relations(autoReplyRules, ({ one, many }) => ({
  user: one(users, {
    fields: [autoReplyRules.userId],
    references: [users.id],
  }),
  socialAccount: one(socialAccounts, {
    fields: [autoReplyRules.socialAccountId],
    references: [socialAccounts.id],
  }),
  logs: many(autoReplyLogs),
}));

export const autoReplyLogsRelations = relations(autoReplyLogs, ({ one }) => ({
  rule: one(autoReplyRules, {
    fields: [autoReplyLogs.ruleId],
    references: [autoReplyRules.id],
  }),
}));

