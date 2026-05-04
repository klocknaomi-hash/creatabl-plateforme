import Link from "next/link";
import { TrendingUp, Heart, MessageCircle, Repeat2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPlatformBranding } from "@/lib/platforms";
import { getTopContent, getCachedAccounts } from "@/lib/dashboard-data";

import { auth } from "@clerk/nextjs/server";

interface TopContentProps {
  topPosts: any[];
  hasAccounts: boolean;
  hasPosts: boolean;
}

export async function TopContent() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const [topPosts, accounts] = await Promise.all([
    getTopContent(clerkId),
    getCachedAccounts(clerkId),
  ]);

  const hasAccounts = (accounts || []).length > 0;
  const hasPosts = topPosts.length > 0;

  return (
    <TopContentView 
      topPosts={topPosts} 
      hasAccounts={hasAccounts} 
      hasPosts={hasPosts} 
    />
  );
}

export function TopContentView({ topPosts, hasAccounts, hasPosts }: TopContentProps) {
  return (
    <section className="space-y-8 mt-12 pb-12">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Meilleurs posts</h2>
          <p className="text-sm font-medium text-muted-foreground/60">Vos posts les plus performants sur tous les réseaux sociaux</p>
        </div>
        <Button variant="ghost" size="sm" className="text-violet-600 font-bold">
          <Link href="/dashboard/analytics">
            Voir l'Analytics détaillé
          </Link>
        </Button>
      </div>

      {!hasAccounts || !hasPosts ? (
         <Card className="rounded-[2.5rem] border-none bg-muted/10 p-20 text-center flex flex-col items-center gap-4 ring-1 ring-border/50">
          <div className="bg-muted/20 p-8 rounded-full">
            <TrendingUp className="size-12 text-muted-foreground/20" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold">Aucune donnée de performance pour le moment</p>
            <p className="text-sm text-muted-foreground/40 max-w-sm mx-auto">Une fois que vous commencerez à publier, nous afficherons vos posts les plus réussis ici avec des métriques détaillées.</p>
          </div>
        </Card>
      ) : topPosts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topPosts.slice(0, 4).map((post: any) => {
            const brand = getPlatformBranding(post.platform);
            const Icon = brand.icon;
            return (
              <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="block group h-full">
                <Card className="rounded-[2.5rem] border-none bg-background shadow-sm ring-1 ring-border/50 hover:ring-violet-600/30 transition-all hover:shadow-2xl hover:shadow-violet-600/5 h-full overflow-hidden flex flex-col">
                  <CardContent className="p-8 flex flex-col flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={cn("size-12 rounded-2xl flex items-center justify-center border border-border/40 shadow-sm transition-transform group-hover:scale-110", brand.bg, brand.color)}>
                        <Icon className="size-6" />
                      </div>
                      <Badge variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] px-3 py-1 uppercase tracking-wider">
                        Meilleure performance
                      </Badge>
                    </div>
                    
                    <p className="text-base font-bold line-clamp-4 text-foreground/90 group-hover:text-violet-600 transition-colors flex-1">
                      {post.content}
                    </p>

                    <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-y-4 gap-x-2">
                      <div className="flex items-center gap-2 group/metric">
                        <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                          <Heart className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Likes</p>
                          <p className="text-sm font-black leading-none">{post.likes?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <MessageCircle className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Commentaires</p>
                          <p className="text-sm font-black leading-none">{post.comments?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                          <Repeat2 className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Partages</p>
                          <p className="text-sm font-black leading-none">{post.shares?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground">
                          <Eye className="size-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-1">Reach</p>
                          <p className="text-sm font-black leading-none">{post.impressions?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border border-dashed border-border/50 p-20 text-center bg-muted/5">
          <p className="text-base font-bold text-muted-foreground/40 italic">En attente de plus de données pour mettre en avant votre contenu</p>
        </div>
      )}
    </section>
  );
}

