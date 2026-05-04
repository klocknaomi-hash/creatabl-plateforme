import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, MoreHorizontal, Repeat2, BarChart2, Bookmark, Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "@/components/platform-icons";

interface MediaFile {
  url: string;
  name: string;
}

interface Account {
  id: string;
  platform: string;
  username: string;
  avatarUrl?: string;
}

interface PostPreviewProps {
  content: string;
  mediaFiles: MediaFile[];
  platforms: string[];
}

export function PostPreview({ content, mediaFiles, platforms }: PostPreviewProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        const fetchedAccounts = data.accounts || [];
        setAccounts(fetchedAccounts);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (platforms.length > 0 && (!activeTab || !platforms.includes(activeTab))) {
      setActiveTab(platforms[0]);
    }
  }, [platforms]);

  if (platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] border border-dashed rounded-2xl bg-muted/5 text-muted-foreground p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-3">
          <TwitterIcon className="w-6 h-6 opacity-20" />
        </div>
        <p className="text-sm font-bold text-foreground/80">Preview visuel</p>
        <p className="text-xs max-w-[150px]">Sélectionnez une plateforme pour voir la preview de votre Post.</p>
      </div>
    );
  }

  const account = accounts.find((a: Account) => a.platform.toLowerCase() === activeTab.toLowerCase());
  const username = account?.username || "Username";
  const avatarUrl = account?.avatarUrl;

  const renderPreview = () => {
    switch (activeTab.toLowerCase()) {
      case 'instagram':
        return (
          <Card className="rounded-xl border border-border/60 shadow-sm overflow-hidden bg-background">
            <div className="p-3 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-[10px] font-bold">{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold">{username}</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardContent className="p-0">
              {mediaFiles.length > 0 ? (
                <div className="relative aspect-square bg-muted">
                  <img src={mediaFiles[0].url} alt="" className="w-full h-full object-cover" />
                  {mediaFiles.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                      1/{mediaFiles.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-muted/10 flex items-center justify-center text-muted-foreground text-[10px] italic">
                  Media Placeholder
                </div>
              )}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 hover:text-red-500 transition-colors" />
                    <MessageCircle className="w-5 h-5" />
                    <Share2 className="w-5 h-5" />
                  </div>
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-bold">1,234 likes</p>
                  <p className="text-[12px] leading-snug">
                    <span className="font-bold mr-1.5">{username}</span>
                    {content || "Your caption..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'twitter':
        return (
          <Card className="rounded-xl border border-border/60 shadow-sm overflow-hidden bg-background font-sans">
            <CardContent className="p-3">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-muted text-foreground font-bold text-xs">{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[14px]">{username}</span>
                    <span className="text-muted-foreground text-[14px]">@{username.toLowerCase()} · 1m</span>
                  </div>
                  <p className="text-[14px] text-foreground leading-snug whitespace-pre-wrap">
                    {content || "What's happening?"}
                  </p>
                  
                  {mediaFiles.length > 0 && (
                    <div className={cn(
                      "mt-2 rounded-xl overflow-hidden border border-border/60 grid gap-0.5",
                      mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      {mediaFiles.slice(0, 4).map((media, i) => (
                        <div key={i} className={cn(
                          "relative aspect-video bg-muted",
                          mediaFiles.length === 3 && i === 0 && "row-span-2 aspect-auto"
                        )}>
                          <img src={media.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 text-muted-foreground max-w-[300px]">
                    <MessageCircle className="w-4 h-4" />
                    <Repeat2 className="w-4 h-4" />
                    <Heart className="w-4 h-4" />
                    <BarChart2 className="w-4 h-4" />
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      <Share2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'facebook':
        return (
          <Card className="rounded-xl border border-border/60 shadow-sm overflow-hidden bg-background">
            <div className="p-3 flex items-center gap-2">
              <Avatar className="w-9 h-9">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-muted text-foreground font-bold text-xs">{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#050505]">{username}</span>
                <span className="text-[11px] text-muted-foreground leading-none">Just now · 🌍</span>
              </div>
            </div>
            <CardContent className="p-0">
              <p className="px-3 pb-3 text-[14px] leading-tight whitespace-pre-wrap">
                {content || "What's on your mind?"}
              </p>
              {mediaFiles.length > 0 && (
                <div className="bg-muted border-y border-border/40">
                  <img src={mediaFiles[0].url} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center justify-between text-muted-foreground text-[12px] mb-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-1">
                    <span className="bg-[#1877F2] text-white p-0.5 rounded-full"><Heart className="w-2 h-2 fill-current" /></span>
                    <span>12</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4 comments</span>
                    <span>2 shares</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[13px]"><Heart className="w-4 h-4" /> Like</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[13px]"><MessageCircle className="w-4 h-4" /> Comment</div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[13px]"><Share2 className="w-4 h-4" /> Share</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'linkedin':
        return (
          <Card className="rounded-xl border border-border/60 shadow-sm overflow-hidden bg-background">
            <div className="p-3 flex items-center gap-2">
              <Avatar className="w-10 h-10 rounded-sm">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-muted text-foreground font-bold text-xs rounded-sm">{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-foreground">{username}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">Software Engineer</span>
                <span className="text-[10px] text-muted-foreground leading-tight">1m · 🌐</span>
              </div>
            </div>
            <CardContent className="p-0">
              <p className="px-3 pb-3 text-[14px] leading-snug whitespace-pre-wrap">
                {content || "What do you want to talk about?"}
              </p>
              {mediaFiles.length > 0 && (
                <div className="bg-muted border-y border-border/40">
                  <img src={mediaFiles[0].url} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-1 text-muted-foreground text-[11px] mb-3">
                  <span className="text-blue-600 font-bold">👍 45</span>
                  <span>· 2 comments</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground font-bold text-[11px]"><Heart className="w-4 h-4" /> Like</div>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground font-bold text-[11px]"><MessageCircle className="w-4 h-4" /> Comment</div>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground font-bold text-[11px]"><Repeat2 className="w-4 h-4" /> Repost</div>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground font-bold text-[11px]"><Send className="w-4 h-4" /> Send</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
      {platforms.length > 1 && (
        <div className="flex flex-wrap gap-1 p-1 bg-muted/10 rounded-lg border border-border/40">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                activeTab === p 
                  ? "bg-foreground text-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {p === 'twitter' ? 'X / Twitter' : p}
            </button>
          ))}
        </div>
      )}
      
      <div className="animate-in fade-in zoom-in-95 duration-300">
        {renderPreview()}
      </div>
    </div>
  );
}
