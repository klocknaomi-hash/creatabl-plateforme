"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  Calendar, 
  Filter,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Copy,
  Image as ImageIcon
} from "lucide-react";
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter 
} from "@/components/platform-icons";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X" },
};

const STATUS_CONFIG: Record<string, { label: string, icon: any, color: string, badge: string }> = {
  draft: { label: "Draft", icon: FileText, color: "text-slate-500", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  scheduled: { label: "Programmé", icon: Clock, color: "text-blue-600", badge: "bg-blue-600 text-white border-transparent" },
  published: { label: "Publié", icon: CheckCircle2, color: "text-emerald-600", badge: "bg-emerald-500 text-white border-transparent" },
  failed: { label: "Échec", icon: XCircle, color: "text-destructive", badge: "bg-destructive text-white border-transparent" },
};

export default function PostsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (platformFilter !== "all") queryParams.set("platform", platformFilter);

  const { data, error, isLoading, mutate } = useSWR(`/api/posts?${queryParams.toString()}`, fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm("Es-tu sûr de vouloir supprimer ce post ?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post supprimé");
        mutate();
      } else {
        toast.error("Échec de la suppression du post");
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="size-12 text-destructive" />
        <p className="text-muted-foreground font-medium">Échec du chargement des posts</p>
        <Button onClick={() => mutate()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tous les posts</h1>
          <p className="text-muted-foreground text-sm">Gérez et suivez votre contenu sur tous les réseaux.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
              <SelectTrigger className="w-[140px] h-9 rounded-full bg-background">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="scheduled">Programmés</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="failed">Échecs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v || "all")}>
            <SelectTrigger className="w-[140px] h-9 rounded-full bg-background">
              <SelectValue placeholder="Réseau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les réseaux</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">X (Twitter)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse border-muted/50 rounded-3xl h-[400px]">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.posts?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-3xl bg-muted/20">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold">Aucun post pour l'instant</h3>
          <p className="text-muted-foreground text-center max-w-xs mt-1">
            Ajuste tes filtres ou crée ton premier post pour commencer.
          </p>
          <Button variant="outline" className="mt-6 rounded-full" onClick={() => (window.location.href = "/dashboard/compose")}>
            Nouveau post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.posts?.map((post: any) => {
            const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
            const StatusIcon = status.icon;

            return (
              <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="block group flex flex-col h-full">
                <Card className="w-full overflow-hidden border-border/50 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-500 rounded-[32px] bg-card flex flex-col h-full">
                  <div className="relative aspect-[16/10] bg-muted/20 overflow-hidden">
                    {post.mediaUrls?.[0] ? (
                      <img src={post.mediaUrls[0]} alt="" className="size-full object-cover transition-transform group-hover:scale-105 duration-700" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground/10">
                        <ImageIcon className="size-16" />
                      </div>
                    )}
                    
                    {/* Floating Platforms Row */}
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                    {(post.platforms ?? []).map((plt: string) => {
                        const brand = PLATFORM_BRANDING[plt];
                        const Icon = brand?.icon || ExternalLink;
                        return (
                          <div key={plt} className="size-7 rounded-xl bg-background/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-border/20" title={plt}>
                            <Icon className={cn("size-3.5", brand?.color || "text-foreground")} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions dropdown */}
                    <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                       <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="secondary" size="icon" className="size-8 rounded-xl shadow-lg bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        }>
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-border/50 shadow-2xl min-w-[160px] p-2">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/posts/${post.id}`)} className="rounded-xl gap-2 h-10">
                            <Eye className="size-4 text-violet-500" />
                            <span className="font-bold text-xs">Voir le post</span>
                          </DropdownMenuItem>
                          {post.status === "published" ? (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/compose?duplicate=${post.id}`)} className="rounded-xl gap-2 h-10">
                              <Copy className="size-4 text-indigo-500" />
                              <span className="font-bold text-xs">Réutiliser le post</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/compose?id=${post.id}`)} className="rounded-xl gap-2 h-10">
                              <Edit3 className="size-4 text-blue-500" />
                              <span className="font-bold text-xs">Modifier le post</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(post.id)} className="rounded-xl gap-2 h-10 text-destructive focus:text-destructive focus:bg-destructive/5">
                            <Trash2 className="size-4" />
                            <span className="font-bold text-xs">Supprimer le post</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-1 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         {(post.platforms ?? []).slice(0, 1).map((plt: string) => {
                            const brand = PLATFORM_BRANDING[plt];
                            const Icon = brand?.icon || ExternalLink;
                            return (
                              <div key={plt} className="flex items-center gap-2">
                                 <Icon className={cn("size-4", brand?.color || "text-foreground")} />
                                 <span className="text-[11px] font-bold uppercase tracking-widest">{brand?.label || plt}</span>
                              </div>
                            );
                         })}
                         {(post.platforms ?? []).length > 1 && (
                           <span className="text-[10px] text-muted-foreground font-bold">+{(post.platforms ?? []).length - 1} plus</span>
                         )}
                      </div>
                      
                      <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-sm", status.badge)}>
                        {status.label}
                      </Badge>
                    </div>

                    <p className="text-sm line-clamp-3 font-semibold leading-relaxed text-foreground/90 flex-1 italic">
                      "{post.content}"
                    </p>

                    <div className="pt-4 mt-auto border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground/60">
                         <Clock className="size-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {post.status === 'scheduled' ? 'Programmé' : 'Publié'}
                         </span>
                      </div>
                      <span className="text-[11px] font-bold text-foreground">
                        {format(new Date(post.scheduledAt || post.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
