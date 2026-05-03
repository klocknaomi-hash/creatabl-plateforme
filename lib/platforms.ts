import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter,
  YoutubeIcon,
  TiktokIcon
} from "@/components/platform-icons";
import { ExternalLink } from "lucide-react";

export const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string, bg: string, border: string, glow: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  youtube: { color: "text-[#FF0000]", icon: YoutubeIcon, label: "YouTube", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  tiktok: { color: "text-foreground", icon: TiktokIcon, label: "TikTok", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
};

export function getPlatformBranding(platform: string) {
  return PLATFORM_BRANDING[platform.toLowerCase()] || { 
    color: "text-foreground", 
    icon: ExternalLink, 
    label: platform, 
    bg: "bg-muted/30", 
    border: "border-border/50", 
    glow: "shadow-none" 
  };
}

export function getPlatformClient(platform: string, token?: string): any {
  return {
    getTokens: async (code: string, codeVerifier?: string) => {
      throw new Error(`OAuth not implemented for: ${platform}`);
    },
    getAuthorizationUrl: async (state: string, codeVerifier?: string) => {
      throw new Error(`OAuth not implemented for: ${platform}`);
    },
    refreshToken: async (refreshToken: string) => {
      throw new Error(`Token refresh not implemented for: ${platform}`);
    },
    publishPost: async (account: any, content: string, mediaUrls: string[]) => {
      throw new Error(`Publishing not implemented for: ${platform}`);
    },
    fetchMetrics: async (account: any, platformPostId: string) => {
      throw new Error(`Metrics not implemented for: ${platform}`);
    },
  };
}