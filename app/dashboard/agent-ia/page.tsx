'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  BrainCircuit, 
  Wand2, 
  Lock, 
  Search, 
  Star, 
  ArrowLeft, 
  Check, 
  Copy, 
  Flame, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  PenSquare, 
  ExternalLink,
  Loader2,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Lightbulb
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// Type definitions
interface TrendItem {
  title: string
  fullTitle?: string
  platform: string
  source: string
  growth: string
  status: string
  category: string
  url?: string
  thumbnail?: string
}

interface GeneratedIdea {
  title: string
  content: string
  hashtags: string[]
  platform: string
  bestTime: string
  score: number
}

export default function AgentIAPage() {
  const { user } = useUser()
  const router = useRouter()
  const firstName = user?.firstName || 'Naomi'

  // Dashboard Page State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous les agents')
  const [selectedPlatform, setSelectedPlatform] = useState('Toutes')
  const [selectedObjective, setSelectedObjective] = useState('Tous')
  const [sortBy, setSortBy] = useState('Popularité')
  const [favorites, setFavorites] = useState<string[]>(['redacteur'])
  const [activeAgent, setActiveAgent] = useState<string | null>(null)

  // Sub-workspaces shared/specific states
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null)
  const [trendSourceFilter, setTrendSourceFilter] = useState('Toutes sources')
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])

  // Agent 1: Rédacteur IA state
  const [redacteurTopic, setRedacteurTopic] = useState('')
  const [redacteurAudience, setRedacteurAudience] = useState('')
  const [redacteurPlatform, setRedacteurPlatform] = useState('linkedin')
  const [redacteurTone, setRedacteurTone] = useState('professional')
  const [redacteurResult, setRedacteurResult] = useState('')

  // Agent 3: Optimiseur SEO state
  const [seoOriginalText, setSeoOriginalText] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [seoResult, setSeoResult] = useState('')
  const [seoScore, setSeoScore] = useState<number | null>(null)

  // Agent 4: Accroche Magique state
  const [accrocheTopic, setAccrocheTopic] = useState('')
  const [accrocheResult, setAccrocheResult] = useState<string[]>([])

  // Agent 5: Générateur de hashtags state
  const [hashtagsText, setHashtagsText] = useState('')
  const [hashtagsResult, setHashtagsResult] = useState<string[]>([])

  // Agent 6: Idées de visuels state
  const [visuelsText, setVisuelsText] = useState('')
  const [visuelsResult, setVisuelsResult] = useState<{ scene: string; colors: string; text: string }[]>([])

  // Fetch trends for Générateur d'idées
  const loadTrends = async () => {
    setLoadingTrends(true)
    try {
      const res = await fetch('/api/agent/trends')
      const data = await res.json()
      if (data.trends) {
        setTrends(data.trends)
      } else {
        toast.error('Aucune tendance trouvée.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la récupération des tendances.')
    } finally {
      setLoadingTrends(false)
    }
  }

  // Effect to load trends when 'ideateur' is opened
  useEffect(() => {
    if (activeAgent === 'ideateur') {
      loadTrends()
    }
  }, [activeAgent])

  // Agents static list matching mockup structure
  const AGENTS = [
    {
      id: 'redacteur',
      title: 'Rédacteur IA',
      badge: 'Rédaction',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
      description: 'Rédige des textes percutants adaptés à votre audience et à vos objectifs.',
      stats: '12.4K utilisations',
      icon: PenSquare,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      category: 'Rédaction',
    },
    {
      id: 'ideateur',
      title: "Générateur d'idées",
      badge: 'Idéation',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
      description: 'Trouve des idées de contenu virales et adaptées à votre niche.',
      stats: '8.7K utilisations',
      icon: Lightbulb,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      category: 'Idéation',
    },
    {
      id: 'seo',
      title: 'Optimiseur SEO',
      badge: 'SEO',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
      description: 'Optimise vos posts pour le référencement et la visibilité.',
      stats: '6.2K utilisations',
      icon: Bot,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      category: 'SEO',
    },
    {
      id: 'accroche',
      title: 'Accroche Magique',
      badge: 'Engagement',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200',
      description: "Crée des accroches irrésistibles qui captent l'attention dès la 1ère ligne.",
      stats: '9.1K utilisations',
      icon: Sparkles,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40',
      category: 'Rédaction',
    },
    {
      id: 'hashtags',
      title: 'Générateur de hashtags',
      badge: 'Réseaux sociaux',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
      description: 'Trouve les meilleurs hashtags pour booster votre portée.',
      stats: '7.3K utilisations',
      icon: BrainCircuit,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      category: 'Réseaux sociaux',
    },
    {
      id: 'visuels',
      title: 'Idées de visuels',
      badge: 'Créatif',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200',
      description: 'Propose des concepts de visuels adaptés à votre contenu.',
      stats: '5.6K utilisations',
      icon: Wand2,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      category: 'Créatif',
    },
  ]

  // Filter & Sort logic for Agents grid
  const filteredAgents = AGENTS.filter(agent => {
    const matchesSearch = agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Tous les agents' || 
                            agent.category === selectedCategory

    // Simulated platform filter logic
    let matchesPlatform = true
    if (selectedPlatform !== 'Toutes') {
      if (selectedPlatform === 'LinkedIn' && agent.id === 'visuels') matchesPlatform = false
      if (selectedPlatform === 'TikTok' && agent.id === 'seo') matchesPlatform = false
    }

    return matchesSearch && matchesCategory && matchesPlatform
  })

  // Toggle favorite helper
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    toast.success('Favoris mis à jour')
  }

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papier !')
  }

  // Redirect to Editor composer with filled parameters
  const openInEditor = (content: string, platform: string = 'linkedin') => {
    router.push(`/dashboard/compose?content=${encodeURIComponent(content)}&platform=${platform.toLowerCase()}`)
  }

  // --- API Generation Handlers ---

  // Agent 1: Rédacteur IA Generation
  const generateRedacteur = async () => {
    if (!redacteurTopic.trim()) {
      return toast.error('Veuillez spécifier le sujet.')
    }
    setLoading(true)
    setRedacteurResult('')
    try {
      const prompt = `Rédige un post pour ${redacteurPlatform.toUpperCase()} destiné à une audience de: "${redacteurAudience || 'générale'}". Sujet: "${redacteurTopic}".`
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: prompt,
          action: 'generate',
          platform: redacteurPlatform,
          tone: redacteurTone
        })
      })
      const data = await res.json()
      if (data.result) {
        setRedacteurResult(data.result)
        toast.success('Post rédigé !')
      } else {
        toast.error(data.error || 'Erreur de génération.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la génération.')
    } finally {
      setLoading(false)
    }
  }

  // Agent 2: Générateur d'idées Generation (from Selected Trend)
  const generateIdeasForTrend = async () => {
    if (!selectedTrend) return
    setLoading(true)
    setGeneratedIdeas([])
    try {
      const res = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trend: selectedTrend.title,
          source: selectedTrend.platform
        })
      })
      const data = await res.json()
      if (data.ideas) {
        setGeneratedIdeas(data.ideas)
        toast.success('Idées générées avec succès !')
      } else {
        toast.error(data.error || 'Erreur lors de la génération.')
      }
    } catch (e) {
      console.error(e)
      toast.error('La génération a échoué.')
    } finally {
      setLoading(false)
    }
  }

  // Agent 3: Optimiseur SEO Generation
  const generateSEO = async () => {
    if (!seoOriginalText.trim()) {
      return toast.error('Veuillez insérer le post original.')
    }
    setLoading(true)
    setSeoResult('')
    try {
      const prompt = `Post original:\n${seoOriginalText}\n\nMots-clés cibles: ${seoKeywords}`
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: prompt,
          action: 'improve',
          tone: 'professional'
        })
      })
      const data = await res.json()
      if (data.result) {
        setSeoResult(data.result)
        setSeoScore(Math.floor(Math.random() * 20) + 80) // Mock score 80-99
        toast.success('Texte optimisé !')
      } else {
        toast.error(data.error || 'Erreur de génération.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur de génération.')
    } finally {
      setLoading(false)
    }
  }

  // Agent 4: Accroche Magique Generation
  const generateAccroches = async () => {
    if (!accrocheTopic.trim()) {
      return toast.error('Veuillez spécifier un sujet ou un brouillon.')
    }
    setLoading(true)
    setAccrocheResult([])
    try {
      const prompt = `Génère 5 idées d'accroches percutantes et accrocheuses en français pour le sujet suivant. Retourne uniquement les 5 phrases séparées par des retours à la ligne: "${accrocheTopic}"`
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: prompt,
          action: 'rewrite'
        })
      })
      const data = await res.json()
      if (data.result) {
        const hooks = data.result
          .split('\n')
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
          .filter((line: string) => line.length > 0)
        setAccrocheResult(hooks.slice(0, 5))
        toast.success('Accroches générées !')
      } else {
        toast.error(data.error || 'Erreur.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur.')
    } finally {
      setLoading(false)
    }
  }

  // Agent 5: Générateur de hashtags Generation
  const generateHashtags = async () => {
    if (!hashtagsText.trim()) {
      return toast.error('Veuillez fournir le texte du post.')
    }
    setLoading(true)
    setHashtagsResult([])
    try {
      const prompt = `Génère 15 hashtags pertinents, optimisés pour augmenter la portée et catégorisés, pour le post suivant. Retourne uniquement les hashtags séparés par des espaces: "${hashtagsText}"`
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: prompt,
          action: 'rewrite'
        })
      })
      const data = await res.json()
      if (data.result) {
        const hashtags = data.result.match(/#[a-zA-Z0-9_]+/g) || []
        setHashtagsResult(hashtags)
        toast.success('Hashtags générés !')
      } else {
        toast.error(data.error || 'Erreur.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur.')
    } finally {
      setLoading(false)
    }
  }

  // Agent 6: Idées de visuels Generation
  const generateVisuels = async () => {
    if (!visuelsText.trim()) {
      return toast.error('Veuillez fournir le contenu du post.')
    }
    setLoading(true)
    setVisuelsResult([])
    try {
      const prompt = `Génère 3 idées de visuels créatifs pour accompagner ce post. Pour chaque idée, décris brièvement la scène (scene), propose les couleurs principales (colors) et le texte à incruster (text) au format JSON. Format de réponse attendu : [{"scene": "...", "colors": "...", "text": "..."}, ...]`
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: prompt,
          action: 'rewrite'
        })
      })
      const data = await res.json()
      if (data.result) {
        try {
          const parsed = JSON.parse(data.result.replace(/```json|```/g, '').trim())
          setVisuelsResult(parsed)
          toast.success('Idées de visuels créées !')
        } catch {
          // Fallback parsing if JSON wasn't returned cleanly
          const scenes = data.result.split('\n\n').map((item: string, i: number) => ({
            scene: item.substring(0, 150),
            colors: 'Couleurs de la marque',
            text: `Visuel ${i + 1}`
          }))
          setVisuelsResult(scenes.slice(0, 3))
        }
      } else {
        toast.error(data.error || 'Erreur.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Erreur.')
    } finally {
      setLoading(false)
    }
  }

  // Filter trends by source badge
  const filteredTrends = trends.filter(trend => {
    if (trendSourceFilter === 'Toutes sources') return true
    if (trendSourceFilter === 'Google') return trend.platform === 'Google'
    if (trendSourceFilter === 'Reddit') return trend.platform === 'Reddit'
    if (trendSourceFilter === 'YouTube') return trend.platform === 'YouTube'
    return true
  })

  // Render a specific sub-workspace
  const renderWorkspace = () => {
    const activeAgentData = AGENTS.find(a => a.id === activeAgent)
    if (!activeAgentData) return null

    const Icon = activeAgentData.icon

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setActiveAgent(null)
                setSelectedTrend(null)
                setGeneratedIdeas([])
              }}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm"
              title="Retour aux agents"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className={`p-2.5 rounded-xl ${activeAgentData.iconBg}`}>
              <Icon className={`size-5 ${activeAgentData.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{activeAgentData.title}</h2>
                <Badge className={activeAgentData.badgeColor + " border text-[10px] font-bold"}>
                  {activeAgentData.badge}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{activeAgentData.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">{activeAgentData.stats}</span>
          </div>
        </div>

        {/* 1. Rédacteur IA Workspace */}
        {activeAgent === 'redacteur' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="redacteur-topic" className="text-xs font-bold text-gray-700">Sujet / Thème du post</Label>
                <Textarea 
                  id="redacteur-topic"
                  placeholder="ex. Les 3 erreurs courantes de Copywriting à éviter absolument..."
                  value={redacteurTopic}
                  onChange={(e) => setRedacteurTopic(e.target.value)}
                  className="min-h-[120px] rounded-xl resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600 bg-gray-50/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="redacteur-audience" className="text-xs font-bold text-gray-700">Audience cible (optionnel)</Label>
                <Input 
                  id="redacteur-audience"
                  placeholder="ex. SMM, Entrepreneurs, Créateurs"
                  value={redacteurAudience}
                  onChange={(e) => setRedacteurAudience(e.target.value)}
                  className="rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:ring-purple-600 bg-gray-50/50"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-700 block">Plateforme</span>
                <div className="flex gap-2">
                  {['linkedin', 'instagram', 'tiktok'].map(plat => (
                    <button
                      key={plat}
                      onClick={() => setRedacteurPlatform(plat)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                        redacteurPlatform === plat 
                          ? 'bg-[#534AB7] border-[#534AB7] text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-700 block">Ton de l'IA</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'professional', label: '💼 Professionnel' },
                    { value: 'storytelling', label: '📖 Storytelling' },
                    { value: 'viral', label: '🚀 Viral' },
                    { value: 'educational', label: '🎓 Éducatif' },
                    { value: 'conversational', label: '💬 Conversationnel' }
                  ].map(tone => (
                    <button
                      key={tone.value}
                      onClick={() => setRedacteurTone(tone.value)}
                      className={`py-2 px-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        redacteurTone === tone.value 
                          ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateRedacteur}
                disabled={loading}
                className="w-full bg-[#534AB7] hover:bg-[#453da3] text-white font-bold h-11 rounded-xl shadow-sm border-transparent"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                Rédiger le post avec l'IA
              </Button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 mb-4">Post Généré</h3>
                {redacteurResult ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto font-medium">
                    {redacteurResult}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-20 text-gray-400 space-y-3">
                    <Bot className="size-10 text-gray-300" />
                    <p className="text-xs font-semibold">Votre contenu rédigé s'affichera ici après la génération.</p>
                  </div>
                )}
              </div>

              {redacteurResult && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(redacteurResult)}
                    className="flex-1 rounded-xl text-xs font-bold border-gray-200 h-10 hover:bg-gray-50"
                  >
                    <Copy className="size-3.5 mr-1.5" /> Copier
                  </Button>
                  <Button 
                    onClick={() => openInEditor(redacteurResult, redacteurPlatform)}
                    className="flex-1 bg-gray-900 hover:bg-black text-white font-bold h-10 rounded-xl text-xs"
                  >
                    Ouvrir dans l'éditeur
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Générateur d'idées Workspace (Trends) */}
        {activeAgent === 'ideateur' && (
          <div className="space-y-8">
            {/* Trend source selection & filter */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Tendances actuelles</h3>
                  <p className="text-xs text-gray-500">Sélectionnez un sujet populaire pour générer des posts adaptés.</p>
                </div>
                
                {/* Source Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {['Toutes sources', 'Google', 'Reddit', 'YouTube'].map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        setTrendSourceFilter(src)
                        setSelectedTrend(null)
                        setGeneratedIdeas([])
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        trendSourceFilter === src 
                          ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trend cards list */}
              {loadingTrends ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="size-6 text-[#534AB7] animate-spin" />
                  <span className="text-xs text-gray-500 font-semibold">Récupération des dernières tendances...</span>
                </div>
              ) : filteredTrends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredTrends.map((trend, idx) => {
                    const isSelected = selectedTrend?.title === trend.title
                    
                    // Style badges based on source platform
                    let badgeClass = 'bg-gray-100 text-gray-700 border-gray-200'
                    if (trend.platform === 'Reddit') badgeClass = 'bg-orange-50 text-orange-600 border-orange-100'
                    if (trend.platform === 'YouTube') badgeClass = 'bg-red-50 text-red-600 border-red-100'

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedTrend(trend)
                          setGeneratedIdeas([])
                        }}
                        className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 bg-white relative overflow-hidden group ${
                          isSelected 
                            ? 'border-[#534AB7] ring-1 ring-[#534AB7] bg-purple-50/10' 
                            : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {trend.platform}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-gray-500">{trend.growth}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#534AB7] transition-all">
                            {trend.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium mt-1 truncate">{trend.source}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {trend.status}
                          </span>
                          {trend.url && (
                            <a 
                              href={trend.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-[#534AB7] transition-all p-0.5"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-xs font-semibold">
                  Aucune tendance disponible pour ce filtre.
                </div>
              )}

              {/* Action trigger once trend is selected */}
              {selectedTrend && (
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-gray-700">
                    Sujet sélectionné : <span className="text-[#534AB7] font-bold">"{selectedTrend.title}"</span>
                  </div>
                  <Button
                    onClick={generateIdeasForTrend}
                    disabled={loading}
                    className="bg-[#534AB7] hover:bg-[#453da3] text-white font-bold rounded-xl h-10 px-5 shadow-sm border-transparent"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                    Générer 3 idées de post IA
                  </Button>
                </div>
              )}
            </div>

            {/* Generated ideas container */}
            {generatedIdeas.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Idées suggérées</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className="bg-[#EEEDFE] text-[#534AB7] border-none text-[10px] font-bold px-2 py-0.5">
                            {idea.platform}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            <Flame className="size-3.5" />
                            <span>{idea.score}%</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-snug">{idea.title}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">Meilleur moment : {idea.bestTime}</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto">
                          {idea.content}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {idea.hashtags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="text-[9px] font-bold text-[#534AB7] bg-purple-50/50 px-1.5 py-0.5 rounded border border-purple-100/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => copyToClipboard(idea.content + '\n\n' + idea.hashtags.join(' '))}
                          className="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-all"
                          title="Copier le post"
                        >
                          <Copy className="size-4" />
                        </button>
                        <Button
                          onClick={() => openInEditor(idea.content + '\n\n' + idea.hashtags.join(' '), idea.platform)}
                          className="flex-1 bg-gray-900 hover:bg-black text-white text-[11px] font-bold h-9 rounded-xl border-transparent"
                        >
                          Utiliser dans l'éditeur
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Optimiseur SEO Workspace */}
        {activeAgent === 'seo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Configuration SEO</h3>

              <div className="space-y-2">
                <Label htmlFor="seo-text" className="text-xs font-bold text-gray-700">Texte original à optimiser</Label>
                <Textarea 
                  id="seo-text"
                  placeholder="Insérez votre post ici..."
                  value={seoOriginalText}
                  onChange={(e) => setSeoOriginalText(e.target.value)}
                  className="min-h-[150px] rounded-xl resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords" className="text-xs font-bold text-gray-700">Mots-clés cibles (séparés par des virgules)</Label>
                <Input 
                  id="seo-keywords"
                  placeholder="ex. marketing digital, productivité, IA"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="rounded-xl border-gray-200 focus-visible:ring-1 focus-visible:ring-amber-500 bg-gray-50/50"
                />
              </div>

              <Button 
                onClick={generateSEO}
                disabled={loading}
                className="w-full bg-[#534AB7] hover:bg-[#453da3] text-white font-bold h-11 rounded-xl shadow-sm border-transparent"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                Optimiser le post pour le SEO
              </Button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Version Optimisée</h3>
                  {seoScore !== null && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Score SEO : {seoScore}/100
                    </span>
                  )}
                </div>

                {seoResult ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto font-medium">
                      {seoResult}
                    </div>

                    <div className="p-4 bg-amber-50/40 border border-amber-100/60 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Analyse de lisibilité</span>
                      <ul className="text-xs text-amber-700 space-y-1 font-medium list-disc list-inside">
                        <li>Mots-clés insérés de façon naturelle</li>
                        <li>Structure avec listes à puces pour maximiser la lecture</li>
                        <li>Intégration d'une question ouverte finale pour l'engagement</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400 space-y-3">
                    <Bot className="size-10 text-gray-300" />
                    <p className="text-xs font-semibold">Le texte optimisé apparaîtra ici après optimisation.</p>
                  </div>
                )}
              </div>

              {seoResult && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(seoResult)}
                    className="flex-1 rounded-xl text-xs font-bold border-gray-200 h-10 hover:bg-gray-50"
                  >
                    <Copy className="size-3.5 mr-1.5" /> Copier
                  </Button>
                  <Button 
                    onClick={() => openInEditor(seoResult)}
                    className="flex-1 bg-gray-900 hover:bg-black text-white font-bold h-10 rounded-xl text-xs"
                  >
                    Ouvrir dans l'éditeur
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Accroche Magique Workspace */}
        {activeAgent === 'accroche' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Configuration Accroches</h3>

              <div className="space-y-2">
                <Label htmlFor="accroche-text" className="text-xs font-bold text-gray-700">Décrivez le sujet ou insérez le post</Label>
                <Textarea 
                  id="accroche-text"
                  placeholder="ex. Un post expliquant comment j'ai automatisé mon calendrier éditorial..."
                  value={accrocheTopic}
                  onChange={(e) => setAccrocheTopic(e.target.value)}
                  className="min-h-[150px] rounded-xl resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-rose-500 bg-gray-50/50"
                />
              </div>

              <Button 
                onClick={generateAccroches}
                disabled={loading}
                className="w-full bg-[#534AB7] hover:bg-[#453da3] text-white font-bold h-11 rounded-xl shadow-sm border-transparent"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                Générer 5 accroches accrocheuses
              </Button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 mb-4">Accroches Proposées</h3>
                {accrocheResult.length > 0 ? (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {accrocheResult.map((hook, index) => (
                      <div key={index} className="group border border-gray-100 hover:border-purple-200 rounded-xl p-4 bg-gray-50/50 hover:bg-purple-50/10 flex items-center justify-between gap-4 transition-all">
                        <p className="text-xs font-bold text-gray-700 leading-relaxed flex-1">"{hook}"</p>
                        <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={() => copyToClipboard(hook)}
                            className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-all shadow-sm"
                            title="Copier l'accroche"
                          >
                            <Copy className="size-3.5" />
                          </button>
                          <button
                            onClick={() => openInEditor(hook)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-[10px] font-bold shadow-sm transition-all"
                          >
                            Écrire
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400 space-y-3">
                    <Bot className="size-10 text-gray-300" />
                    <p className="text-xs font-semibold">Les accroches apparaîtront ici après la génération.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Générateur de hashtags Workspace */}
        {activeAgent === 'hashtags' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Contenu du Post</h3>

              <div className="space-y-2">
                <Label htmlFor="hashtags-post" className="text-xs font-bold text-gray-700">Insérez votre texte de post</Label>
                <Textarea 
                  id="hashtags-post"
                  placeholder="Collez ici votre texte pour en extraire et générer des hashtags optimisés..."
                  value={hashtagsText}
                  onChange={(e) => setHashtagsText(e.target.value)}
                  className="min-h-[150px] rounded-xl resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 bg-gray-50/50"
                />
              </div>

              <Button 
                onClick={generateHashtags}
                disabled={loading}
                className="w-full bg-[#534AB7] hover:bg-[#453da3] text-white font-bold h-11 rounded-xl shadow-sm border-transparent"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                Générer les hashtags
              </Button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 mb-4">Hashtags Proposés</h3>
                {hashtagsResult.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-1">
                      {hashtagsResult.map((tag, index) => (
                        <span 
                          key={index} 
                          onClick={() => copyToClipboard(tag)}
                          className="cursor-pointer text-xs font-bold text-blue-600 bg-blue-50/60 hover:bg-blue-100 hover:scale-105 px-3 py-1.5 rounded-xl border border-blue-100 transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[10px] text-gray-400 font-semibold italic">Cliquez sur un hashtag individuel pour le copier.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400 space-y-3">
                    <Bot className="size-10 text-gray-300" />
                    <p className="text-xs font-semibold">Les hashtags générés s'afficheront ici.</p>
                  </div>
                )}
              </div>

              {hashtagsResult.length > 0 && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(hashtagsResult.join(' '))}
                    className="w-full rounded-xl text-xs font-bold border-gray-200 h-10 hover:bg-gray-50"
                  >
                    <Copy className="size-3.5 mr-1.5" /> Copier tous les hashtags
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Idées de visuels Workspace */}
        {activeAgent === 'visuels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">Description / Post</h3>

              <div className="space-y-2">
                <Label htmlFor="visuels-post" className="text-xs font-bold text-gray-700">Insérez votre texte de post</Label>
                <Textarea 
                  id="visuels-post"
                  placeholder="Décrivez votre idée de post ou collez le post rédigé pour concevoir des idées de visuels assortis..."
                  value={visuelsText}
                  onChange={(e) => setVisuelsText(e.target.value)}
                  className="min-h-[150px] rounded-xl resize-none border-gray-200 focus-visible:ring-1 focus-visible:ring-cyan-500 bg-gray-50/50"
                />
              </div>

              <Button 
                onClick={generateVisuels}
                disabled={loading}
                className="w-full bg-[#534AB7] hover:bg-[#453da3] text-white font-bold h-11 rounded-xl shadow-sm border-transparent"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                Générer les concepts de visuels
              </Button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 mb-4">Scénarios Visuels suggérés</h3>
                {visuelsResult.length > 0 ? (
                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                    {visuelsResult.map((concept, index) => (
                      <div key={index} className="border border-gray-100 rounded-xl p-4 bg-gray-50/40 space-y-2">
                        <span className="text-[10px] font-extrabold text-[#534AB7] uppercase tracking-wider block">Concept {index + 1}</span>
                        <p className="text-xs font-bold text-gray-800"><span className="text-gray-400">Scène : </span>{concept.scene}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] font-semibold text-gray-500">
                          <span>🎨 Couleurs : {concept.colors}</span>
                          <span>💬 Texte incrusté : "{concept.text}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400 space-y-3">
                    <Bot className="size-10 text-gray-300" />
                    <p className="text-xs font-semibold">Les concepts de visuels apparaîtront ici.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- Main Dashboard Screen ---
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Dynamic Render Workspace if activeAgent is selected */}
      {activeAgent ? (
        renderWorkspace()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-in fade-in duration-200">
          
          {/* LEFT CONTAINER - 3 columns on lg */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Header Block matching mockup styling */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Agent IA ✦</h1>
              </div>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                Vos agents spécialisés pour vous aider à créer du contenu plus vite et mieux.
              </p>
            </div>

            {/* Custom Tab component, only showing "Mes agents" as requested */}
            <div className="border-b border-gray-100">
              <div className="flex gap-6 text-sm font-bold">
                <button className="text-[#534AB7] border-b-2 border-[#534AB7] pb-3 px-1 transition-all">
                  Mes agents
                </button>
              </div>
            </div>

            {/* Copilot Purple card description banner */}
            <div className="bg-[#EEEDFE]/40 border border-[#534AB7]/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-5">
                {/* Illustration placeholder */}
                <div className="size-14 rounded-2xl bg-gradient-to-br from-[#534AB7] to-purple-400 flex items-center justify-center shadow-md shadow-purple-100 shrink-0">
                  <Bot className="size-7 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Votre copilote de création de contenu</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                    Nos agents IA spécialisés vous accompagnent à chaque étape : idées, écriture, optimisation, visuels et plus encore.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => toast.info("Nos guides d'utilisation sont accessibles dans la barre latérale droite.")}
                className="bg-white hover:bg-gray-50 text-[#534AB7] hover:text-[#453da3] border-[#534AB7]/20 rounded-xl h-10 px-5 text-xs font-bold shrink-0 shadow-sm"
              >
                Découvrir comment ça marche
              </Button>
            </div>

            {/* Filter controls matching mockup */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-gray-200 rounded-xl bg-white shadow-sm focus-visible:ring-1 focus-visible:ring-[#534AB7] text-xs font-semibold"
                />
              </div>

              {/* Mock Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Category select */}
                <div className="relative">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none pr-8 pl-3 h-10 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 shadow-sm focus-visible:ring-1 focus-visible:ring-[#534AB7] outline-none cursor-pointer"
                  >
                    <option>Tous les agents</option>
                    <option>Rédaction</option>
                    <option>Idéation</option>
                    <option>SEO</option>
                    <option>Réseaux sociaux</option>
                    <option>Créatif</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Platform select */}
                <div className="relative">
                  <select 
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="appearance-none pr-8 pl-3 h-10 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 shadow-sm focus-visible:ring-1 focus-visible:ring-[#534AB7] outline-none cursor-pointer"
                  >
                    <option value="Toutes">Plateforme</option>
                    <option>LinkedIn</option>
                    <option>Instagram</option>
                    <option>TikTok</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Objective select */}
                <div className="relative">
                  <select 
                    value={selectedObjective}
                    onChange={(e) => setSelectedObjective(e.target.value)}
                    className="appearance-none pr-8 pl-3 h-10 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 shadow-sm focus-visible:ring-1 focus-visible:ring-[#534AB7] outline-none cursor-pointer"
                  >
                    <option value="Tous">Objectif</option>
                    <option>Engager</option>
                    <option>Vendre</option>
                    <option>Éduquer</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Sorting select */}
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pr-8 pl-3 h-10 border border-gray-200 rounded-xl bg-white text-xs font-bold text-gray-600 shadow-sm focus-visible:ring-1 focus-visible:ring-[#534AB7] outline-none cursor-pointer"
                  >
                    <option>Trier par</option>
                    <option>Popularité</option>
                    <option>Récents</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                </div>

              </div>
            </div>

            {/* Grid of 6 agents cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
                const AgentIcon = agent.icon
                const isFavorited = favorites.includes(agent.id)

                return (
                  <div
                    key={agent.id}
                    onClick={() => setActiveAgent(agent.id)}
                    className="bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50/10 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between gap-5 relative overflow-hidden group shadow-sm"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`p-2.5 rounded-xl ${agent.iconBg} transition-all`}>
                        <AgentIcon className={`size-5 ${agent.iconColor}`} />
                      </div>
                      
                      {/* Favorite star */}
                      <button
                        onClick={(e) => toggleFavorite(agent.id, e)}
                        className={`p-1.5 rounded-xl border border-gray-50 hover:bg-gray-50 hover:border-gray-200 transition-all ${
                          isFavorited ? 'text-amber-500' : 'text-gray-300 hover:text-gray-400'
                        }`}
                        title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star className={`size-4 ${isFavorited ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Middle description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#534AB7] transition-all">
                          {agent.title}
                        </h3>
                        <Badge className={agent.badgeColor + " border text-[9px] font-bold py-0"}>
                          {agent.badge}
                        </Badge>
                      </div>
                      
                      <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                        {agent.description}
                      </p>
                    </div>

                    {/* Footer usages & CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {agent.stats}
                      </span>
                      
                      <Button
                        size="xs"
                        variant="outline"
                        className="bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-gray-200 rounded-lg text-[10px] font-extrabold h-7 px-3 flex items-center gap-1 shrink-0"
                      >
                        Utiliser
                        <ChevronRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Note: The "+ voir plus d'agents" button/section has been removed per instructions. */}

          </div>

          {/* RIGHT SIDEBAR COLUMN - 1 column on lg */}
          <div className="space-y-6">
            
            {/* Usage limit card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-800">Utilisation des agents</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold text-gray-900">124</span>
                  <span className="text-xs text-gray-400 font-bold">/ 300 utilisations ce mois</span>
                </div>
              </div>

              {/* Progress bar styled like mockup */}
              <div className="h-2 w-full bg-purple-50 rounded-full overflow-hidden">
                <div className="h-full bg-[#534AB7] rounded-full" style={{ width: '41.3%' }} />
              </div>

              <div className="text-[10px] text-gray-400 font-semibold">
                Renouvellement dans 18 jours
              </div>
            </div>

            {/* Categories sidebar navigation */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider text-gray-400 mb-2">Catégories</h4>
              
              <div className="space-y-1.5">
                {[
                  { name: 'Tous les agents', count: 12, label: 'Tous les agents' },
                  { name: 'Rédaction', count: 3, label: 'Rédaction' },
                  { name: 'Idéation', count: 2, label: 'Idéation' },
                  { name: 'SEO', count: 2, label: 'SEO' },
                  { name: 'Réseaux sociaux', count: 2, label: 'Réseaux sociaux' },
                  { name: 'Créatif', count: 2, label: 'Créatif' },
                  { name: 'Analyse', count: 1, label: 'Analyse' },
                ].map((cat) => {
                  const isCurrentCat = selectedCategory === cat.name
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold transition-all ${
                        isCurrentCat 
                          ? 'bg-purple-50/50 text-[#534AB7] font-bold' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCurrentCat ? 'bg-[#534AB7]/10 text-[#534AB7]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Popular agents listing matching mockup */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider text-gray-400 mb-2">Agents populaires</h4>
              
              <div className="space-y-3.5">
                {[
                  { id: 'redacteur', name: 'Rédacteur IA', stats: '12.4K utilisations', icon: PenSquare, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
                  { id: 'ideateur', name: "Générateur d'idées", stats: '8.7K utilisations', icon: Lightbulb, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
                  { id: 'accroche', name: 'Accroche Magique', stats: '9.1K utilisations', icon: Sparkles, iconColor: 'text-rose-600', iconBg: 'bg-rose-50' },
                ].map((pop) => {
                  const Icon = pop.icon
                  const isFav = favorites.includes(pop.id)

                  return (
                    <div 
                      key={pop.id}
                      onClick={() => setActiveAgent(pop.id)}
                      className="flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${pop.iconBg}`}>
                          <Icon className={`size-3.5 ${pop.iconColor}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800 group-hover:text-[#534AB7] transition-all">
                            {pop.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            {pop.stats}
                          </div>
                        </div>
                      </div>

                      {/* Favorite Toggle Star */}
                      <button
                        onClick={(e) => toggleFavorite(pop.id, e)}
                        className={`text-gray-300 hover:text-amber-500 transition-all ${
                          isFav ? 'text-amber-500' : ''
                        }`}
                      >
                        <Star className={`size-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Need help guides matching mockup */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-800">Besoin d'aide ?</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                Découvrez nos guides et tutoriels pour tirer le meilleur de vos agents IA.
              </p>
              
              <button
                onClick={() => toast.success("Chargement des guides d'aide...")}
                className="w-full flex items-center justify-between px-3 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#534AB7] hover:text-[#453da3] text-xs font-bold transition-all shadow-sm bg-white"
              >
                <span>Voir les guides</span>
                <ExternalLink className="size-3.5 text-gray-400" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
