"use client";

import { Suspense, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  Edit3,
  Filter,
  Eye,
  Copy,
  Plus,
  X,
} from "lucide-react";
import { EmptyState, PageHeader, PostCard } from "@/components/ds";
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
import { useConfirm } from "@/components/ds/confirm";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const STATUS_ITEMS = {
  all: "Tous les statuts",
  draft: "Brouillons",
  scheduled: "Programmés",
  published: "Publiés",
  failed: "Échecs",
};

const PLATFORM_ITEMS = {
  all: "Tous les réseaux",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  twitter: "X (Twitter)",
};

export default function PostsPage() {
  return (
    <Suspense fallback={null}>
      <PostsList />
    </Suspense>
  );
}

function PostsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = (searchParams.get("q") ?? "").trim();
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") ?? "all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (platformFilter !== "all") queryParams.set("platform", platformFilter);

  const { data, error, isLoading, mutate } = useSWR(`/api/posts?${queryParams.toString()}`, fetcher);

  const confirmDialog = useConfirm();
  const handleDelete = async (id: string) => {
    if (!(await confirmDialog({ title: "Supprimer ce post ?", description: "Le post sera supprimé de Creatabl. Les publications déjà en ligne restent sur les réseaux.", confirmLabel: "Supprimer le post" }))) return;

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

  // Recherche lancée depuis la Top Bar : filtre sur le texte des posts.
  const posts: any[] = (data?.posts ?? []).filter((post: any) =>
    search ? String(post.content ?? "").toLowerCase().includes(search.toLowerCase()) : true
  );

  if (error) {
    return (
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <EmptyState
          illustration="posts"
          title="Impossible de charger vos publications"
          text="Vérifiez votre connexion puis réessayez."
        >
          <button type="button" className="cr-btn cr-btn--primary" onClick={() => mutate()}>Réessayer</button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full">
      <PageHeader
        title="Publications"
        description="Gérez et suivez votre contenu sur tous les réseaux."
        actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select items={STATUS_ITEMS} value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
              <SelectTrigger className="w-[170px] h-10 rounded-full bg-white border-[#878399]">
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
          <Select items={PLATFORM_ITEMS} value={platformFilter} onValueChange={(v) => setPlatformFilter(v || "all")}>
            <SelectTrigger className="w-[170px] h-10 rounded-full bg-white border-[#878399]">
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
        }
      />

      {search && (
        <div className="flex items-center gap-2 text-sm text-[#4B4B63]">
          <span>
            {posts.length} résultat{posts.length > 1 ? "s" : ""} pour « {search} »
          </span>
          <button type="button" className="cr-btn cr-btn--neutral cr-btn--sm" onClick={() => router.push("/dashboard/posts")}>
            <X size={14} aria-hidden="true" />
            Effacer
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="cr-post animate-pulse" style={{ minHeight: 172 }}>
              <div className="h-6 w-1/3 rounded-full bg-[#F8F7FC]" />
              <div className="h-4 w-full rounded bg-[#F8F7FC]" />
              <div className="h-4 w-2/3 rounded bg-[#F8F7FC]" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          illustration="posts"
          title={search || statusFilter !== "all" || platformFilter !== "all" ? "Aucune publication trouvée" : "Aucune publication pour l'instant"}
          text={
            search || statusFilter !== "all" || platformFilter !== "all"
              ? "Modifiez vos filtres ou votre recherche pour retrouver vos posts."
              : "Créez votre premier post : il apparaîtra ici, avec son statut sur chaque réseau."
          }
        >
          <button type="button" className="cr-btn cr-btn--primary" onClick={() => router.push("/dashboard/compose")}>
            <Plus size={18} aria-hidden="true" />
            Créer un post
          </button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/dashboard/posts/${post.id}`} className="block h-full rounded-[12px] transition-shadow hover:shadow-[0_12px_32px_rgba(20,18,31,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7225E3]">
              <PostCard
                content={post.content}
                platforms={post.platforms ?? []}
                status={post.status}
                date={post.publishedAt || post.scheduledAt || post.createdAt}
                mediaUrl={post.mediaUrls?.[0]}
                errorMessage={post.platformResults?.find((r: any) => r.status === "failed")?.errorMessage}
                actions={
                  <span className="cr-post-more" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<button type="button" className="cr-iconbtn" style={{ width: 32, height: 32 }} aria-label="Actions du post" />}>
                        <MoreHorizontal size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[180px] p-1.5">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/posts/${post.id}`)} className="gap-2">
                          <Eye className="size-4" />
                          Voir le post
                        </DropdownMenuItem>
                        {post.status === "published" ? (
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/compose?duplicate=${post.id}`)} className="gap-2">
                            <Copy className="size-4" />
                            Réutiliser le post
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/compose?id=${post.id}`)} className="gap-2">
                            <Edit3 className="size-4" />
                            Modifier le post
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(post.id)} className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="size-4" />
                          Supprimer le post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                }
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
