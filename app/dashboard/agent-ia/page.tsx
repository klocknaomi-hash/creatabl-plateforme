'use client'

import { useState, useEffect } from 'react'
import { useAccess } from '@/hooks/useAccess'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Bot, 
  Sparkles, 
  Search, 
  ArrowRight, 
  RefreshCw, 
  Calendar, 
  Check, 
  AlertTriangle,
  History,
  PenSquare,
  Wand2,
  ChevronRight,
  TrendingUp,
  Cpu,
  ThumbsUp,
  BrainCircuit,
  Lock,
  Crown,
  FileText,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  LinkedinIcon,
  InstagramIcon,
  TiktokIcon
} from '@/components/platform-icons'
import { cn } from '@/lib/utils'

interface Trend {
  title: string
  platform: string
  growth: string
  status: string
}

interface Idea {
  title: string
  content: string
  hashtags: string[]
  platform: string
  bestTime: string
  score: number
}

const SPARKLINES = [
  "M 0 22 C 20 8, 40 28, 60 12 C 80 4, 100 24, 120 6",
  "M 0 16 C 15 26, 45 4, 60 18 C 75 28, 105 2, 120 12",
  "M 0 25 C 20 5, 45 15, 60 10 C 80 5, 100 25, 120 4",
  "M 0 12 C 25 22, 50 2, 70 20 C 90 26, 110 8, 120 14"
]

export default function AgentIAPage() {
  const access = useAccess()
  const { user } = useUser()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'trends' | 'generation'>('trends')
  const [trends, setTrends] = useState<Trend[]>([])
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [generating, setGenerating] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null)
  
  // Refresh tracking
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [minutesSinceRefresh, setMinutesSinceRefresh] = useState(0)

  // Edit Idea Modal State
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Calculate greeting
  const firstName = user?.firstName || 'Créateur'

  // Fetch trends on load
  const fetchTrends = async () => {
    setLoadingTrends(true)
    try {
      const res = await fetch('/api/agent/trends')
      const data = await res.json()
      if (data.trends) {
        setTrends(data.trends)
        setLastRefreshed(new Date())
        setMinutesSinceRefresh(0)
      } else {
        toast.error('Impossible de charger les tendances.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors du chargement des tendances.')
    } finally {
      setLoadingTrends(false)
    }
  }

  useEffect(() => {
    if (access.aiAdvanced) {
      fetchTrends()
    }
  }, [access.aiAdvanced])

  // Minutes since last refresh counter
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 60000)
      setMinutesSinceRefresh(diff)
    }, 30000)
    return () => clearInterval(timer)
  }, [lastRefreshed])

  // Call Content Generation API
  const generateIdeas = async (topic: string) => {
    setActiveTab('generation')
    setGenerating(true)
    setSelectedTrend(topic)
    
    try {
      const res = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend: topic })
      })

      const data = await res.json()
      if (res.ok && data.ideas) {
        setIdeas(data.ideas)
        toast.success(`3 idées générées pour "${topic}" !`)
      } else {
        toast.error(data.error || 'La génération de contenu a échoué.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur de connexion avec le service de génération.')
    } finally {
      setGenerating(false)
    }
  }

  // Handle Quick Actions
  const handleQuickAction = (action: string) => {
    if (action === 'trends') {
      setActiveTab('trends')
      fetchTrends()
      toast.success('Recherche des dernières tendances en cours...')
    } else if (action === 'generate') {
      setActiveTab('generation')
    } else if (action === 'create') {
      setActiveTab('generation')
      toast.info('Choisissez une tendance ou tapez un sujet ci-dessus pour commencer.')
    } else {
      toast.info(`L'action "${action}" est une suggestion d'analyse. Tapez votre demande dans le chat.`)
    }
  }

  // Handle Chat Submit
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    
    generateIdeas(chatInput.trim())
    setChatInput('')
  }

  // Create Post and Redirect
  const handleCreatePost = (idea: Idea) => {
    const content = encodeURIComponent(`${idea.title}\n\n${idea.content}\n\n${idea.hashtags.join(' ')}`)
    const platform = idea.platform.toLowerCase()
    router.push(`/dashboard/compose?content=${content}&platform=${platform}`)
  }

  // Open Edit Dialog
  const handleOpenEdit = (index: number) => {
    setEditingIndex(index)
    setEditTitle(ideas[index].title)
    setEditContent(ideas[index].content)
  }

  // Save Edits
  const handleSaveEdit = () => {
    if (editingIndex === null) return
    const updated = [...ideas]
    updated[editingIndex] = {
      ...updated[editingIndex],
      title: editTitle,
      content: editContent
    }
    setIdeas(updated)
    setEditingIndex(null)
    toast.success("L'idée a bien été mise à jour.")
  }

  // Gate Check
  if (!access.aiAdvanced) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full max-w-md border border-border/60 bg-background rounded-2xl shadow-xl p-6 text-center space-y-6">
          <CardHeader className="space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Agent IA ✦ Plan Business
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              L'Agent IA est disponible uniquement pour les abonnés Business.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Détectez automatiquement les sujets tendance du moment sur Google Trends, LinkedIn et Instagram, et générez en un clic du contenu engageant et prêt à être planifié grâce à Gemini.
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl transition-all shadow-sm">
              <a href="https://creatabl-ia.com/tarifs">
                Passer au plan Business →
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Helpers for platform badges and colors
  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase()
    if (p === 'linkedin') return <LinkedinIcon className="w-4 h-4 text-[#0077b5]" />
    if (p === 'instagram') return <InstagramIcon className="w-4 h-4 text-[#ee2a7b]" />
    if (p === 'tiktok') return <TiktokIcon className="w-4 h-4 text-black dark:text-white" />
    return <Sparkles className="w-4 h-4 text-primary" />
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('très viral')) {
      return <Badge className="bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 text-[10px] font-bold">Très viral</Badge>
    }
    if (s.includes('viral')) {
      return <Badge className="bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30 text-[10px] font-bold">Viral</Badge>
    }
    return <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 text-[10px] font-bold">En hausse</Badge>
  }

  return (
    <div className="space-y-8 pb-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Agent IA ✦
            </h1>
            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Business
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Discutez avec votre agent IA, découvrez les tendances et générez du contenu qui performe.
          </p>
        </div>
        <Button 
          onClick={() => toast.info("Création d'agents personnalisés disponible prochainement !")}
          className="rounded-xl font-semibold shadow-sm bg-foreground text-background transition-all hover:opacity-90 active:scale-95 text-xs h-9 px-4"
        >
          Créer un agent
        </Button>
      </header>

      {/* ── Chat Section (Top) ── */}
      <section className="bg-gradient-to-br from-primary/5 via-purple-500/[0.02] to-transparent border border-primary/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="space-y-1">
          <span className="text-sm font-medium text-primary">Bonjour {firstName} 👋</span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Comment puis-je vous aider aujourd'hui ?
          </h2>
        </div>

        {/* Chat input */}
        <form onSubmit={handleChatSubmit} className="flex gap-2 w-full max-w-4xl">
          <div className="relative flex-1">
            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Posez une question à votre agent IA ou demandez-lui d'écrire sur un sujet..."
              className="pl-9 pr-4 py-6 rounded-xl border border-border/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary shadow-sm text-sm"
            />
          </div>
          <Button type="submit" size="lg" className="rounded-xl px-5 bg-primary hover:bg-primary/95 text-white font-semibold">
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        {/* Quick actions tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground mr-1">Actions rapides :</span>
          <button 
            onClick={() => handleQuickAction('trends')} 
            className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-foreground/30 transition-all font-medium text-foreground/80 cursor-pointer"
          >
            🔍 Trouver des tendances
          </button>
          <button 
            onClick={() => handleQuickAction('generate')} 
            className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-foreground/30 transition-all font-medium text-foreground/80 cursor-pointer"
          >
            💡 Générer des idées
          </button>
          <button 
            onClick={() => handleQuickAction('create')} 
            className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-foreground/30 transition-all font-medium text-foreground/80 cursor-pointer"
          >
            ✍️ Créer du contenu
          </button>
          <button 
            onClick={() => handleQuickAction('niche')} 
            className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-foreground/30 transition-all font-medium text-foreground/80 cursor-pointer"
          >
            📊 Analyser ma niche
          </button>
          <button 
            onClick={() => handleQuickAction('optimise')} 
            className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-foreground/30 transition-all font-medium text-foreground/80 cursor-pointer"
          >
            ⚡ Optimiser un post
          </button>
          <button 
            onClick={() => handleQuickAction('help')} 
            className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-foreground/30 transition-all font-medium text-foreground/80 cursor-pointer"
          >
            ❓ Aide et conseils
          </button>
        </div>
      </section>

      {/* ── Tabs Bar ── */}
      <div className="flex border-b border-border/80">
        <button
          onClick={() => setActiveTab('trends')}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'trends' 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Tendances détectées
        </button>
        <button
          onClick={() => setActiveTab('generation')}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'generation' 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <BrainCircuit className="w-4 h-4" />
          Génération de contenu IA
          {ideas.length > 0 && (
            <Badge className="ml-1 px-1.5 py-0.5 text-[9px] bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold rounded-full">
              {ideas.length}
            </Badge>
          )}
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-[350px]">
        {activeTab === 'trends' ? (
          /* TAB 1: Trends */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Tendances du moment</h3>
                <p className="text-xs text-muted-foreground">
                  Sujets populaires détectés sur Google Trends, Instagram, TikTok et LinkedIn.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-9 rounded-xl border border-border bg-background px-3 py-1 text-xs font-semibold focus-visible:ring-1 focus-visible:ring-primary shadow-sm outline-none cursor-pointer">
                  <option>Toutes catégories</option>
                  <option>Technologie & IA</option>
                  <option>Business & Marketing</option>
                  <option>Productivité</option>
                </select>
                <Button 
                  onClick={fetchTrends} 
                  variant="outline" 
                  size="sm" 
                  disabled={loadingTrends}
                  className="rounded-xl h-9 text-xs"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loadingTrends && "animate-spin")} />
                  Actualiser
                </Button>
              </div>
            </div>

            {loadingTrends ? (
              /* Trends Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-border/60 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-5 w-28 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-8 w-16 rounded-md" />
                      <Skeleton className="h-4 w-12 rounded-md" />
                    </div>
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </Card>
                ))}
              </div>
            ) : (
              /* Trends Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {trends.map((trend, i) => {
                  const sparklineColor = i % 2 === 0 ? '#10b981' : '#534AB7'
                  const sparklineClass = i % 2 === 0 ? 'text-emerald-500' : 'text-primary'

                  return (
                    <Card key={i} className="border border-border/60 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-[#534AB7] dark:text-[#a09beb] truncate max-w-[140px]" title={trend.title}>
                            {trend.title}
                          </span>
                          {getStatusBadge(trend.status)}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {getPlatformIcon(trend.platform)}
                            <span className="font-medium text-[11px]">{trend.platform}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-500">
                            {trend.growth}
                          </span>
                        </div>
                      </div>

                      {/* Mini Sparkline Chart */}
                      <div className="py-1">
                        <svg className="w-full h-8 overflow-visible" viewBox="0 0 120 32">
                          <path
                            d={SPARKLINES[i % SPARKLINES.length]}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={sparklineClass}
                          />
                        </svg>
                      </div>

                      <Button 
                        onClick={() => generateIdeas(trend.title)}
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 mt-2"
                      >
                        <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                        Voir des idées
                      </Button>
                    </Card>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-2">
              <span>
                Actualisé il y a {minutesSinceRefresh === 0 ? "quelques secondes" : `${minutesSinceRefresh} min`}
              </span>
              <span className="italic">
                Les données se rafraîchissent toutes les heures automatiquement
              </span>
            </div>
          </div>
        ) : (
          /* TAB 2: Generation */
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {selectedTrend ? `Contenu pour : ${selectedTrend}` : 'Génération de contenu IA'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Idées de posts générées à partir des tendances sélectionnées.
                </p>
              </div>
              <Button 
                onClick={() => toast.info("Historique des générations à venir")}
                variant="outline" 
                size="sm" 
                className="rounded-xl text-xs"
              >
                <History className="w-3.5 h-3.5 mr-1.5" />
                Historique
              </Button>
            </div>

            {generating ? (
              /* Generating Skeletons */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-border/60 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-16 rounded-md" />
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </div>
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded-md" />
                      <Skeleton className="h-4 w-full rounded-md" />
                      <Skeleton className="h-4 w-2/3 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-32 rounded-md" />
                    <div className="flex gap-2 pt-4">
                      <Skeleton className="h-9 flex-1 rounded-xl" />
                      <Skeleton className="h-9 flex-1 rounded-xl" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : ideas.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-2xl p-12 text-center bg-muted/10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">Aucune idée générée</h4>
                <p className="text-xs text-muted-foreground max-w-sm mb-6">
                  Sélectionnez l'une des tendances du moment ou saisissez votre propre sujet dans la zone de chat ci-dessus.
                </p>
                <Button 
                  onClick={() => setActiveTab('trends')}
                  className="rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs h-9 px-4 shadow-sm"
                >
                  Découvrir les tendances
                </Button>
              </div>
            ) : (
              /* Generated Ideas list */
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {ideas.map((idea, index) => (
                    <Card key={index} className="border border-border/60 rounded-2xl hover:border-primary/20 hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                            Idée {index + 1}
                          </span>
                          
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold">
                            Score IA: {idea.score}/100
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-[15px] font-bold text-foreground line-clamp-1">
                            {idea.title}
                          </h4>
                          <p className="text-xs text-muted-foreground/80 line-clamp-4 leading-relaxed">
                            {idea.content}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {idea.hashtags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-[10px] font-semibold text-primary/80">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getPlatformIcon(idea.platform)}
                            <span className="font-semibold text-foreground/80">{idea.platform}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3 text-primary/70" />
                            <span>Publier : {idea.bestTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleOpenEdit(index)} 
                            variant="outline" 
                            size="sm"
                            className="flex-1 rounded-xl text-xs font-semibold h-9"
                          >
                            Modifier
                          </Button>
                          <Button 
                            onClick={() => handleCreatePost(idea)} 
                            size="sm"
                            className="flex-1 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/95 text-white h-9 shadow-sm"
                          >
                            Créer un post
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* More ideas CTA */}
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={() => {
                      if (selectedTrend) {
                        generateIdeas(selectedTrend)
                      } else {
                        toast.info("Veuillez d'abord sélectionner une tendance.")
                      }
                    }} 
                    variant="outline"
                    className="rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all text-xs font-bold px-6 h-10"
                    disabled={generating}
                  >
                    {generating ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                    + Voir plus d'idées
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Idea Modal ── */}
      <Dialog open={editingIndex !== null} onOpenChange={(open) => !open && setEditingIndex(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 border border-border/80 shadow-2xl bg-background">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <PenSquare className="w-5 h-5 text-primary" />
              Modifier l'idée de post
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ajustez le titre ou le contenu avant de l'envoyer au planificateur de posts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title" className="text-xs font-bold text-foreground/75">Titre du post</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="edit-content" className="text-xs font-bold text-foreground/75">Légende / Contenu</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={7}
                className="rounded-xl focus-visible:ring-1 focus-visible:ring-primary resize-none shadow-sm text-sm leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setEditingIndex(null)} className="rounded-xl text-xs font-semibold h-9">
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} size="sm" className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/95 text-white h-9 shadow-sm">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
