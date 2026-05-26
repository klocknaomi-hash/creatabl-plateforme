'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useAccess } from '@/hooks/useAccess'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  Eye, 
  Copy, 
  Clock, 
  CheckCircle2, 
  FileText, 
  XCircle,
  MessageSquare,
  Lock,
  Crown
} from 'lucide-react'
import { 
  InstagramIcon as Instagram, 
  LinkedinIcon as Linkedin, 
  FacebookIcon as Facebook, 
  TwitterIcon as Twitter 
} from '@/components/platform-icons'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const PLATFORM_BRANDING: Record<string, { color: string, icon: any }> = {
  instagram: { color: "text-[#E1306C]", icon: Instagram },
  linkedin: { color: "text-[#0077B5]", icon: Linkedin },
  facebook: { color: "text-[#1877F2]", icon: Facebook },
  twitter: { color: "text-foreground", icon: Twitter },
}

const STATUS_CONFIG: Record<string, { label: string, color: string, bg: string }> = {
  draft: { label: "À faire", color: "text-slate-500", bg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400" },
  scheduled: { label: "En cours", color: "text-blue-500", bg: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400" },
  published: { label: "Terminé", color: "text-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" },
  failed: { label: "Échec", color: "text-rose-500", bg: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400" },
}

export default function ProjectsPage() {
  const access = useAccess()
  const router = useRouter()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'liste' | 'calendrier'>('liste')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')

  const { data, error, isLoading, mutate } = useSWR('/api/posts?limit=100', fetcher)

  const handleDelete = async (id: string) => {
    if (!confirm("Es-tu sûr de vouloir supprimer ce post ?")) return

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Post supprimé")
        mutate()
      } else {
        toast.error("Échec de la suppression")
      }
    } catch (err) {
      toast.error("Une erreur est survenue")
    }
  }

  // Filter posts
  const allPosts = data?.posts || []
  const filteredPosts = allPosts.filter((post: any) => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatusFilter === 'all' || post.status === selectedStatusFilter
    return matchesSearch && matchesStatus
  })

  // Fast filter counts
  const todoCount = allPosts.filter((p: any) => p.status === 'draft').length
  const inProgressCount = allPosts.filter((p: any) => p.status === 'scheduled').length
  const doneCount = allPosts.filter((p: any) => p.status === 'published').length

  // Gate check
  if (!access.team) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full max-w-md border border-border/60 bg-background rounded-2xl shadow-xl p-6 text-center space-y-6">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Projets d'Équipe ✦ Business
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              Les projets d'équipe sont réservés aux abonnés Business.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Collaborez sur un tableau Kanban ou une liste de projets commune. Planifiez et assignez les publications à vos collaborateurs pour une coordination parfaite.
          </CardContent>
          <CardFooter className="justify-center">
            <Button 
              render={<a href="https://creatabl-ia.com/tarifs" />}
              size="lg" 
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-sm"
            >
              Passer au plan Business →
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex gap-6 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Main Panel ── */}
      <div className="flex-1 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Projets de l'équipe
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualisez et gérez l'avancement de toutes vos publications planifiées.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/compose')}
            className="rounded-xl font-semibold shadow-sm bg-primary hover:bg-primary/95 text-white text-xs h-10 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau post
          </Button>
        </header>

        {/* Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
          <div className="flex border-b border-transparent">
            <button
              onClick={() => setActiveTab('liste')}
              className={cn(
                "px-5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer",
                activeTab === 'liste' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Vue Liste
            </button>
            <button
              onClick={() => setActiveTab('calendrier')}
              className={cn(
                "px-5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer",
                activeTab === 'calendrier' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Vue Calendrier
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un post..."
              className="pl-9 pr-4 py-1.5 h-8.5 rounded-xl border border-border/80 focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-xs"
            />
          </div>
        </div>

        {/* Content Board */}
        {isLoading ? (
          <div className="space-y-4 py-12 text-center">
            <Plus className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Chargement des projets...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-2xl bg-muted/5">
            <FolderKanban className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-sm font-bold text-foreground">Aucun projet trouvé</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Ajustez vos filtres de recherche ou créez un nouveau post pour le planifier.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post: any) => {
              const statusConf = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft
              
              // Get thumbnail
              const thumbnail = post.mediaUrls?.[0]
              
              return (
                <div 
                  key={post.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border/50 rounded-2xl bg-card hover:border-primary/20 hover:shadow-sm transition-all gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center">
                      {thumbnail ? (
                        <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FolderKanban className="w-5 h-5 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Post content preview */}
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate max-w-[400px]">
                        {post.content || "Sans titre"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge className={cn("px-2 py-0.5 rounded-full border-none text-[9px] font-bold uppercase", statusConf.bg)}>
                          {statusConf.label}
                        </Badge>
                        <span>&bull;</span>
                        <span className="font-medium">
                          {post.scheduledAt || post.publishedAt || post.createdAt
                            ? format(new Date(post.scheduledAt || post.publishedAt || post.createdAt), "dd MMM yyyy, HH:mm")
                            : "Non planifié"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Platforms, Assignee and Action buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0">
                    
                    {/* Platforms */}
                    <div className="flex gap-1.5">
                      {post.platforms?.map((plt: string) => {
                        const brand = PLATFORM_BRANDING[plt]
                        const Icon = brand?.icon || FolderKanban
                        return (
                          <div key={plt} className="w-7 h-7 rounded-xl bg-muted/40 flex items-center justify-center border border-border/30" title={plt}>
                            <Icon className={cn("w-3.5 h-3.5", brand?.color || "text-muted-foreground")} />
                          </div>
                        )
                      })}
                    </div>

                    {/* Assignee Avatar */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs" title={user?.fullName || "Propriétaire"}>
                        {user?.firstName?.charAt(0) || "U"}
                      </div>
                      <span className="text-xs font-semibold text-slate-300 group-data-[collapsible=icon]:hidden">
                        {user?.firstName || "Vous"}
                      </span>
                    </div>

                    {/* Action Dropdown */}
                    <div className="shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-muted" />
                        }>
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-border/50 shadow-2xl min-w-[160px] p-2">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/posts/${post.id}`)} className="rounded-xl gap-2 h-10">
                            <Eye className="w-4 h-4 text-violet-500" />
                            <span className="font-bold text-xs">Voir le post</span>
                          </DropdownMenuItem>
                          {post.status === "published" ? (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/compose?duplicate=${post.id}`)} className="rounded-xl gap-2 h-10">
                              <Copy className="w-4 h-4 text-indigo-500" />
                              <span className="font-bold text-xs">Dupliquer</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/compose?id=${post.id}`)} className="rounded-xl gap-2 h-10">
                              <Edit3 className="w-4 h-4 text-blue-500" />
                              <span className="font-bold text-xs">Modifier</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(post.id)} className="rounded-xl gap-2 h-10 text-destructive focus:text-destructive focus:bg-destructive/5">
                            <Trash2 className="w-4 h-4" />
                            <span className="font-bold text-xs">Supprimer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right Filter Panel ── */}
      <div className="w-80 shrink-0 hidden xl:block space-y-6">
        <Card className="border border-border/60 bg-muted/5 rounded-2xl p-6 space-y-6">
          <div className="space-y-1.5 border-b border-border/40 pb-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Filtres du projet
            </h3>
            <p className="text-[11px] text-muted-foreground">Filtrer rapidement par statut de publication</p>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setSelectedStatusFilter('all')}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                selectedStatusFilter === 'all' 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-border/60 hover:bg-muted/10 text-muted-foreground"
              )}
            >
              <span>Tous les posts</span>
              <Badge className="bg-slate-100 text-slate-700 border-none rounded-full px-2 py-0.5 text-[9px] font-bold">
                {allPosts.length}
              </Badge>
            </button>

            <button 
              onClick={() => setSelectedStatusFilter('draft')}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                selectedStatusFilter === 'draft' 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-border/60 hover:bg-muted/10 text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                À faire (Brouillons)
              </span>
              <Badge className="bg-slate-100 text-slate-700 border-none rounded-full px-2 py-0.5 text-[9px] font-bold">
                {todoCount}
              </Badge>
            </button>

            <button 
              onClick={() => setSelectedStatusFilter('scheduled')}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                selectedStatusFilter === 'scheduled' 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-border/60 hover:bg-muted/10 text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                En cours (Programmés)
              </span>
              <Badge className="bg-slate-100 text-slate-700 border-none rounded-full px-2 py-0.5 text-[9px] font-bold">
                {inProgressCount}
              </Badge>
            </button>

            <button 
              onClick={() => setSelectedStatusFilter('published')}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                selectedStatusFilter === 'published' 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-border/60 hover:bg-muted/10 text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Terminés (Publiés)
              </span>
              <Badge className="bg-slate-100 text-slate-700 border-none rounded-full px-2 py-0.5 text-[9px] font-bold">
                {doneCount}
              </Badge>
            </button>
          </div>
        </Card>
      </div>

    </div>
  )
}
