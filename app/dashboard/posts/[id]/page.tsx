"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  ExternalLink,
  FileText,
  TrendingUp,
  BarChart3,
  Copy,
  Image as ImageIcon
} from "lucide-react";
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter,
  YoutubeIcon,
  TiktokIcon
} from "@/components/platform-icons";

const PLATFORM_BRANDING: Record<string, { color: string, icon: any, label: string, bg: string, border: string, glow: string }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram, label: "Instagram", bg: "bg-[#E1306C]/10", border: "border-border/50", glow: "shadow-none" },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin, label: "LinkedIn", bg: "bg-[#0077B5]/10", border: "border-border/50", glow: "shadow-none" },
  facebook: { color: "text-[#1877F2]", icon: Facebook, label: "Facebook", bg: "bg-[#1877F2]/10", border: "border-border/50", glow: "shadow-none" },
  twitter: { color: "text-foreground", icon: Twitter, label: "X", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
  youtube: { color: "text-[#FF0000]", icon: YoutubeIcon, label: "YouTube", bg: "bg-[#FF0000]/10", border: "border-border/50", glow: "shadow-none" },
  tiktok: { color: "text-foreground", icon: TiktokIcon, label: "TikTok", bg: "bg-muted/30", border: "border-border/50", glow: "shadow-none" },
};

function getPlatformBranding(platform: string) {
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostPreview } from "@/components/compose/post-preview";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const STATUS_CONFIG: Record<string, { label: string, icon: any, color: string, badge: string }> = {
  draft: { label: "Brouillon", icon: FileText, color: "text-slate-500", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  scheduled: { label: "Programmé", icon: Clock, color: "text-blue-600", badge: "bg-blue-600 text-white border-transparent" },
  published: { label: "Publié", icon: CheckCircle2, color: "text-emerald-600", badge: "bg-emerald-500 text-white border-transparent" },
  failed: { label: "Échec", icon: XCircle, color: "text-destructive", badge: "bg-destructive text-white border-transparent" },
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [deleting, setDeleting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(`/api/posts/${id}`, fetcher);

  const handleDelete = async () => {
    if (!confirm("Es-tu sûr de vouloir supprimer ce post ?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post supprimé avec succès");
        router.push("/dashboard/posts");
      } else {
        toast.error("Échec de la suppression du post");
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-16 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-8 bg-muted rounded-full w-24" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-72" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded-xl w-32" />
            <div className="h-10 bg-muted rounded-xl w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-muted/50 h-[300px] bg-muted/10" />
            <Card className="rounded-[2.5rem] border-muted/50 h-[250px] bg-muted/10" />
          </div>
          <Card className="rounded-[2.5rem] border-muted/50 h-[500px] bg-muted/10" />
        </div>
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center px-4">
        <AlertCircle className="size-16 text-destructive" />
        <h2 className="text-xl font-bold">Post introuvable</h2>
        <p className="text-muted-foreground text-sm">Ce post n'existe pas ou vous n'avez pas l'autorisation d'y accéder.</p>
        <Button onClick={() => router.push("/dashboard/posts")} className="rounded-xl mt-2">
          Retourner aux posts
        </Button>
      </div>
    );
  }

  const post = data.post;
  const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  // Formatting media files for the PostPreview component
  const mediaFiles = post.mediaUrls ? post.mediaUrls.map((url: string, i: number) => ({
    url,
    name: `Média ${i + 1}`
  })) : [];

  // Calculate aggregated performance metrics from platform results
  const platformResults = post.platformResults || [];
  const metrics = platformResults.reduce(
    (acc: any, res: any) => {
      acc.likes += res.likes || 0;
      acc.comments += res.comments || 0;
      acc.shares += res.shares || 0;
      acc.reach += res.reach || 0;
      acc.impressions += res.impressions || 0;
      return acc;
    },
    { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 }
  );

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto w-full pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/dashboard/posts")}
          className="rounded-full gap-2 text-muted-foreground hover:text-foreground pl-2"
        >
          <ArrowLeft className="size-4" />
          <span>Retour aux posts</span>
        </Button>
      </div>

      {/* Header Info & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight">Détails du post</h1>
            <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider border-none shadow-sm", status.badge)}>
              <StatusIcon className="size-3 mr-1.5 inline-block" />
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {post.status === 'published' 
              ? `Publié le ${format(new Date(post.publishedAt || post.updatedAt || post.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}` 
              : post.status === 'scheduled'
                ? `Programmé pour le ${format(new Date(post.scheduledAt), "d MMMM yyyy à HH:mm", { locale: fr })}`
                : `Créé le ${format(new Date(post.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}`
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {post.status === "published" ? (
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/compose?duplicate=${post.id}`)}
              className="rounded-xl shadow-sm gap-2 font-bold text-xs"
            >
              <Copy className="size-4 text-indigo-500" />
              <span>Réutiliser</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/compose?id=${post.id}`)}
              className="rounded-xl shadow-sm gap-2 font-bold text-xs"
            >
              <Edit3 className="size-4 text-blue-500" />
              <span>Modifier</span>
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl shadow-sm gap-2 font-bold text-xs"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            <span>Supprimer</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Content (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-8 min-w-0 flex-1">
          {/* Post Content & Media */}
          <Card className="rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden bg-card">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest">Message</h3>
                <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap text-foreground/90 italic">
                  "{post.content}"
                </p>
              </div>

              {/* Targets / Platforms Row */}
              <div className="space-y-3 pt-4 border-t border-border/30">
                <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest">Plateformes ciblées</h3>
                <div className="flex flex-wrap gap-2">
                  {post.platforms?.map((plt: string) => {
                    const brand = getPlatformBranding(plt);
                    const Icon = brand.icon;
                    return (
                      <div 
                        key={plt} 
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-border/20 text-xs font-bold shadow-sm",
                          brand.bg, brand.color
                        )}
                      >
                        <Icon className="size-4" />
                        <span className="capitalize">{brand.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance metrics (only for published) */}
          {post.status === 'published' && (
            <Card className="rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden bg-card">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="size-5 text-violet-500" />
                  Performances globales du post
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground/60">Statistiques cumulées sur l'ensemble des réseaux</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-8">
                {/* Aggregated KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl border border-border/50 bg-red-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-red-500">
                      <Heart className="size-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Likes</span>
                    </div>
                    <p className="text-2xl font-black">{metrics.likes.toLocaleString()}</p>
                  </div>

                  <div className="p-5 rounded-3xl border border-border/50 bg-blue-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-blue-500">
                      <MessageCircle className="size-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Comments</span>
                    </div>
                    <p className="text-2xl font-black">{metrics.comments.toLocaleString()}</p>
                  </div>

                  <div className="p-5 rounded-3xl border border-border/50 bg-violet-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-violet-500">
                      <Repeat2 className="size-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Partages</span>
                    </div>
                    <p className="text-2xl font-black">{metrics.shares.toLocaleString()}</p>
                  </div>

                  <div className="p-5 rounded-3xl border border-border/50 bg-slate-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Eye className="size-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">Reach</span>
                    </div>
                    <p className="text-2xl font-black">{(metrics.reach || metrics.impressions).toLocaleString()}</p>
                  </div>
                </div>

                {/* Individual Platform Performance Breakdown */}
                {platformResults.length > 0 && (
                  <div className="pt-6 border-t border-border/30 space-y-4">
                    <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest">Détail par plateforme</h3>
                    <div className="space-y-3">
                      {platformResults.map((result: any) => {
                        const brand = getPlatformBranding(result.platform);
                        const PlatformIcon = brand.icon;
                        return (
                          <div 
                            key={result.id} 
                            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-violet-500/20 hover:bg-muted/10 transition-all duration-300 gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("size-9 rounded-xl flex items-center justify-center border border-border/20", brand.bg, brand.color)}>
                                <PlatformIcon className="size-4.5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold capitalize">{brand.label}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  {result.status === 'success' ? (
                                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="size-3" />
                                      Publié
                                    </span>
                                  ) : result.status === 'failed' ? (
                                    <span className="text-destructive font-bold flex items-center gap-1" title={result.errorMessage}>
                                      <XCircle className="size-3" />
                                      Échec
                                    </span>
                                  ) : (
                                    <span className="text-yellow-500 font-bold flex items-center gap-1">
                                      <Clock className="size-3" />
                                      En attente
                                    </span>
                                  )}
                                  {result.publishedAt && (
                                    <span>· {format(new Date(result.publishedAt), "d MMM, HH:mm", { locale: fr })}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Individual Platform KPIs */}
                            {result.status === 'success' && (
                              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-foreground/80">
                                <div className="flex items-center gap-1.5">
                                  <Heart className="size-3.5 text-red-500" />
                                  <span>{result.likes}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MessageCircle className="size-3.5 text-blue-500" />
                                  <span>{result.comments}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Repeat2 className="size-3.5 text-violet-500" />
                                  <span>{result.shares}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Eye className="size-3.5 text-slate-500" />
                                  <span>{result.reach || result.impressions}</span>
                                </div>
                                {result.platformPostId && (
                                  <a 
                                    href={`#`} // Ideally would point to direct link, or placeholder
                                    className="text-[10px] text-violet-600 hover:underline flex items-center gap-1 font-black pl-2"
                                  >
                                    <ExternalLink className="size-3" />
                                    Voir
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Live Mockup Preview */}
        <aside className="w-full sticky top-24 space-y-4">
          <Card className="rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden bg-card p-6">
            <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mb-4 px-1">Aperçu visuel</h3>
            <PostPreview 
              content={post.content} 
              mediaFiles={mediaFiles} 
              platforms={post.platforms || []} 
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
