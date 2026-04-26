"use client";

import { TwitterIcon, InstagramIcon, FacebookIcon, LinkedinIcon } from "@/components/platform-icons";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PlatformSelector({ 
  connectedPlatforms 
}: { 
  connectedPlatforms: string[] 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPlatform = searchParams.get("platform") || "all";

  const platforms = [
    { id: "all", label: "All Platforms", icon: null },
    { id: "twitter", label: "X / Twitter", icon: TwitterIcon },
    { id: "instagram", label: "Instagram", icon: InstagramIcon },
    { id: "facebook", label: "Facebook", icon: FacebookIcon },
    { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon },
  ];

  const setPlatform = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === currentPlatform) {
      params.delete("platform");
    } else {
      params.set("platform", id);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Select Platform</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {platforms.map((p) => {
          if (p.id === "all") return null;
          
          const isConnected = connectedPlatforms.includes(p.id);
          const isActive = currentPlatform === p.id;
          const Icon = p.icon;

          return (
            <button
              key={p.id}
              disabled={!isConnected}
              onClick={() => setPlatform(p.id)}
              className={cn(
                "group flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all border-2",
                isActive 
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/10" 
                  : "bg-background border-border/40 hover:border-primary/20 text-muted-foreground",
                !isConnected && "opacity-30 cursor-not-allowed grayscale border-dashed"
              )}
            >
              {Icon && <Icon className={cn("size-3.5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground/60")} />}
              <span className="uppercase tracking-tight">{p.label.split(' / ')[0]}</span>
              {!isConnected && (
                <span className="ml-1 px-1 py-0.5 rounded-md bg-muted text-[7px] font-black opacity-60">
                  OFF
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
