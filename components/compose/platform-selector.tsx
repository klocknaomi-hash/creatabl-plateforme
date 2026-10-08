"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "@/components/platform-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  platform: string;
  username: string;
  avatarUrl?: string;
}

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onToggle: (platform: string) => void;
}

const PLATFORM_ICONS: Record<string, any> = {
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  facebook: FacebookIcon,
};

export function PlatformSelector({ selectedPlatforms, onToggle }: PlatformSelectorProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data.accounts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch accounts", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-xl bg-muted/5">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Chargement des comptes…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {accounts.map((account) => {
        const isSelected = selectedPlatforms.includes(account.platform);
        const Icon = PLATFORM_ICONS[account.platform.toLowerCase()] || Check;
        
        return (
          <div
            key={account.id}
            onClick={() => onToggle(account.platform)}
            className={cn(
              "relative flex items-center gap-3 p-1.5 pr-4 rounded-full border cursor-pointer transition-all hover:bg-muted/5 select-none group",
              isSelected 
                ? "bg-[#F3EEFD] text-[#5B1BB8] border-[#7225E3]" 
                : "bg-background border-border/60 hover:border-border"
            )}
          >
            <div className="relative">
              <Avatar className="w-8 h-8 border border-background shadow-sm">
                <AvatarImage src={account.avatarUrl} />
                <AvatarFallback className={cn("text-[10px] font-bold", isSelected ? "bg-background text-foreground" : "bg-primary/10 text-primary")}>
                  {account.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-background flex items-center justify-center text-white shadow-sm",
                account.platform.toLowerCase() === 'twitter' ? "bg-black" : 
                account.platform.toLowerCase() === 'instagram' ? "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" : 
                account.platform.toLowerCase() === 'linkedin' ? "bg-[#0077b5]" : 
                account.platform.toLowerCase() === 'facebook' ? "bg-[#1877f2]" : "bg-primary"
              )}>
                <Icon className="w-2.5 h-2.5" />
              </div>
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className={cn("text-[13px] font-semibold truncate", isSelected ? "text-[#5B1BB8]" : "text-foreground")}>
                {account.username}
              </span>
            </div>

            {isSelected && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#7225E3] border-2 border-background flex items-center justify-center shadow-md z-10">
                <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
              </div>
            )}
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          router.push("/dashboard/settings/connections");
        }}
        className="h-11 px-4 rounded-full border border-dashed border-[#878399] text-[#4B4B63] hover:border-[#7225E3] hover:text-[#7225E3] hover:bg-[#F3EEFD] transition-all gap-2 group"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Connecter un compte</span>
      </Button>
    </div>
  );
}
