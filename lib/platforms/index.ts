import { socialAccounts } from '@/lib/db/schema';
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter,
  YoutubeIcon,
  TiktokIcon
} from "@/components/platform-icons";
import { ExternalLink } from "lucide-react";

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

export const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string, bg: string, border: string, glow: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram", bg: "bg-[#E1306C]/10", border: "border-border/50", glow: "shadow-none" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn", bg: "bg-[#0077B5]/10", border: "border-border/50", glow: "shadow-none" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook", bg: "bg-[#1877F2]/10", border: "border-border/50", glow: "shadow-none" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  youtube: { color: "text-[#FF0000]", icon: YoutubeIcon, label: "YouTube", bg: "bg-[#FF0000]/10", border: "border-border/50", glow: "shadow-none" },
  tiktok: { color: "text-foreground", icon: TiktokIcon, label: "TikTok", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
};

export function getPlatformBranding(platform: string) {
  const branding = PLATFORM_BRANDING[platform.toLowerCase()] || { 
    color: "text-foreground", 
    icon: ExternalLink, 
    label: platform, 
    bg: "bg-muted/30", 
    border: "border-border/50", 
    glow: "shadow-none" 
  };

  return {
    ...branding,
    name: branding.label,
    bgColor: branding.bg
  };
}
