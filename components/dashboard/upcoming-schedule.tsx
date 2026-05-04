import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlatformBranding } from "@/lib/platforms";
import { getUpcomingPosts } from "@/lib/dashboard-data";

import { auth } from "@clerk/nextjs/server";

interface UpcomingScheduleProps {
  upcomingPosts: any[];
}

export async function UpcomingSchedule() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const posts = await getUpcomingPosts(clerkId);
  return <UpcomingScheduleView upcomingPosts={posts} />;
}

export function UpcomingScheduleView({ upcomingPosts }: UpcomingScheduleProps) {
  return (
    <Card className="rounded-[2.5rem] border-none bg-background shadow-lg shadow-muted/20 ring-1 ring-border/50 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-3">
          <div className="size-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
            <Clock className="size-5 text-violet-600" />
          </div>
          Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {upcomingPosts.length > 0 ? (
          <div className="divide-y divide-border/10">
            {upcomingPosts.map((post: any) => {
              const brand = getPlatformBranding(post.platforms?.[0] || "");
              const Icon = brand.icon;
              return (
                <a 
                  key={post.id} 
                  href={`/dashboard/posts/${post.id}`}
                  className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn("size-10 rounded-xl flex items-center justify-center bg-background border border-border/40 shrink-0 transition-all group-hover:shadow-md", brand.color)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold line-clamp-1 group-hover:text-violet-600 transition-colors">{post.content}</p>
                      <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                        {format(new Date(post.scheduledAt), "HH:mm", { locale: fr })} • {brand.label}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground/20 group-hover:text-violet-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">La file d'attente est vide</p>
            <Button variant="link" size="sm" className="text-sm font-bold text-violet-600 p-0 h-auto">
              <a href="/dashboard/compose">Programmer un post</a>
            </Button>
          </div>
        )}
        <div className="p-4 bg-muted/20 border-t border-border/10">
          <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-muted-foreground hover:text-violet-600">
            <a href="/dashboard/calendar">Voir le calendrier complet</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

