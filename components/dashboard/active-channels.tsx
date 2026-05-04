import Link from "next/link";
import { Layers, ArrowUpRight, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter,
  YoutubeIcon,
  TiktokIcon
} from "@/components/platform-icons";
import { getCachedAccounts, getCachedUserSettings } from "@/lib/dashboard-data";
import { getTranslation } from "@/lib/i18n";

const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string, bg: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram", bg: "bg-muted/30" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn", bg: "bg-muted/30" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook", bg: "bg-muted/30" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X", bg: "bg-muted/30" },
  youtube: { color: "text-[#FF0000]", icon: YoutubeIcon, label: "YouTube", bg: "bg-muted/30" },
  tiktok: { color: "text-foreground", icon: TiktokIcon, label: "TikTok", bg: "bg-muted/30" },
};

import { auth } from "@clerk/nextjs/server";

interface ActiveChannelsProps {
  accounts: any[];
  t: any;
}

export async function ActiveChannels() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const [accounts, settings] = await Promise.all([
    getCachedAccounts(clerkId),
    getCachedUserSettings(clerkId),
  ]);

  const t = getTranslation(settings?.language || "en");

  return <ActiveChannelsView accounts={accounts || []} t={t} />;
}

export function ActiveChannelsView({ accounts, t }: ActiveChannelsProps) {
  if (accounts.length === 0) return null;

  return (
    <section className="px-1 py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-violet-600/10 flex items-center justify-center">
            <Layers className="size-4 text-violet-600" />
          </div>
          <h2 className="text-sm font-bold tracking-tight">{t.activeChannels || "Active Channels"}</h2>
        </div>
        <Link href="/dashboard/accounts" className="text-xs font-bold text-muted-foreground hover:text-violet-600 transition-colors flex items-center gap-1.5 group">
          {t.manageAccounts || "Manage Accounts"}
          <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {accounts.map((acc: any) => {
          const brand = PLATFORM_BRANDING[acc.platform.toLowerCase()];
          const Icon = brand?.icon || ExternalLink;
          return (
            <Link key={acc.id} href="/dashboard/accounts" className="group">
              <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-background border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-violet-600/20 group-active:scale-[0.98]">
                <div className={cn(
                  "size-9 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105", 
                  brand?.bg || "bg-muted/30", 
                  brand?.color || "text-foreground"
                )}>
                  <Icon className="size-4.5" />
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <p className="text-[11px] font-bold truncate leading-tight">@{acc.username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">{brand?.label || acc.platform}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        <Link href="/dashboard/accounts" className="group">
          <div className="flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-muted/5 border border-dashed border-border/60 hover:bg-muted/10 transition-all h-full group-active:scale-[0.98]">
            <div className="size-9 rounded-full bg-background flex items-center justify-center text-muted-foreground/40 shadow-sm group-hover:text-violet-600 transition-colors">
              <Plus className="size-4" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground/60 group-hover:text-violet-600 transition-colors whitespace-nowrap">Connecter la plateforme</span>
          </div>
        </Link>
      </div>
    </section>
  );
}

