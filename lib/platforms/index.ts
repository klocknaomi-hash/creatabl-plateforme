import { socialAccounts } from '@/lib/db/schema';

export type SocialAccount = typeof socialAccounts.$inferSelect;

export interface PlatformClient {
  getAuthorizationUrl(params?: { state?: string; codeChallenge?: string }): string | Promise<{ url: string; [key: string]: any }>;
  getTokens(code: string, codeVerifier?: string, oauthTokenSecret?: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    platformUserId: string;
    username: string;
    avatarUrl?: string;
  }>;
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;
  publishPost(account: SocialAccount, content: string, mediaUrls?: string[]): Promise<string>;
  fetchComments(account: SocialAccount, platformPostId: string): Promise<any[]>;
  postReply(account: SocialAccount, platformCommentId: string, text: string): Promise<void>;
  fetchMetrics(account: SocialAccount, platformPostId: string): Promise<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }>;
}

import { TwitterClient } from './twitter';
import { LinkedInClient } from './linkedin';
import { FacebookClient } from './facebook';
import { InstagramClient } from './instagram';
import { YouTubeClient } from './youtube';

export const platformClients: Record<string, PlatformClient> = {
  twitter: new TwitterClient(),
  linkedin: new LinkedInClient(),
  facebook: new FacebookClient(),
  instagram: new InstagramClient(),
  youtube: new YouTubeClient(),
};

export function getPlatformClient(platform: string): PlatformClient {
  const client = platformClients[platform];
  if (!client) {
    throw new Error(`Platform ${platform} not supported`);
  }
  return client;
}
