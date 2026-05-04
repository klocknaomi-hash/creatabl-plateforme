import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlatformBranding } from "@/lib/platforms";
import { getRecentDrafts } from "@/lib/dashboard-data";

import { auth } from "@clerk/nextjs/server";

interface RecentDraftsProps {
  recentDrafts: any[];
}

export async function RecentDrafts() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const drafts = await getRecentDrafts(clerkId);
  return <RecentDraftsView recentDrafts={drafts} />;
}

export function RecentDraftsView({ recentDrafts }: RecentDraftsProps) {
  return (
    <Card className="rounded-[2.5rem] border-none bg-background shadow-lg shadow-muted/20 ring-1 ring-border/50 overflow-hidden">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="size-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
            <FileText className="size-5 text-violet-600" />
          </div>
          Drafts
        </CardTitle>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-violet-600/10 hover:text-violet-600">
          <a href="/dashboard/compose">
            <Plus className="size-5" />
          </a>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {recentDrafts.length > 0 ? (
          <div className="divide-y divide-border/10">
            {recentDrafts.map((post: any) => (
              <a 
                key={post.id} 
                href={`/dashboard/compose?id=${post.id}`}
                className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    {format(new Date(post.createdAt), "MMM d", { locale: fr })}
                  </span>
                  <div className="flex -space-x-1.5">
                    {post.platforms?.map((p: string) => {
                      const brand = getPlatformBranding(p);
                      const Icon = brand.icon;
                      return (
                        <div key={p} className="size-5 rounded-full bg-background border border-border/40 flex items-center justify-center p-1 shadow-sm">
                          <Icon className={cn("size-full", brand.color)} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm font-bold line-clamp-1 text-foreground/80 group-hover:text-violet-600 transition-colors">{post.content || "Draft sans titre..."}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Aucun Draft trouvé</p>
            <Button variant="link" size="sm" className="text-sm font-bold text-violet-600 p-0 h-auto">
              <a href="/dashboard/compose">Créer un Draft</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

