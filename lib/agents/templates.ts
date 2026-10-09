// Modèles d'agents proposés dans « Créer un agent » et « Modèles ». Partagé entre
// l'interface et l'API : aucune dépendance serveur ici.

export type AgentSource = 'google_trends' | 'google_news' | 'reddit' | 'youtube' | 'web'
export type AgentOutput = 'drafts' | 'ideas'
export type AgentSchedule = 'manual' | 'daily' | 'weekly'

export const MAX_AGENTS = 3

export const SOURCE_LABELS: Record<AgentSource, string> = {
  google_trends: 'Google Trends',
  google_news: 'Google Actualités',
  reddit: 'Reddit',
  youtube: 'YouTube',
  web: 'Pages web',
}

export const SCHEDULE_LABELS: Record<AgentSchedule, string> = {
  manual: 'Lancement manuel',
  daily: 'Chaque jour',
  weekly: 'Chaque lundi',
}

export type AgentConfig = {
  name: string
  goal: string
  template?: string | null
  sources: AgentSource[]
  keywords: string[]
  urls: string[]
  platforms: string[]
  output: AgentOutput
  postCount: number
  schedule: AgentSchedule
}

export type AgentTemplate = {
  id: string
  chip: string
  title: string
  description: string
  icon: 'radar' | 'eye' | 'reddit' | 'trend' | 'article' | 'calendar'
  prompt: string
  config: Omit<AgentConfig, 'name' | 'goal'> & { name: string; goal: string }
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'veille-secteur',
    chip: 'Veille de mon secteur',
    title: 'Veille de mon secteur',
    description: "Les actualités de votre secteur, transformées en idées de posts.",
    icon: 'radar',
    prompt: "Fais la veille de l'actualité de mon secteur et propose 3 posts à partir des sujets les plus intéressants.",
    config: {
      name: 'Veille de mon secteur',
      goal: "Repérer les actualités récentes de mon secteur et en tirer des posts utiles pour ma communauté.",
      sources: ['google_news', 'google_trends'],
      keywords: [],
      urls: [],
      platforms: ['linkedin'],
      output: 'drafts',
      postCount: 3,
      schedule: 'weekly',
    },
  },
  {
    id: 'surveiller-concurrent',
    chip: 'Surveiller un concurrent',
    title: 'Surveiller un concurrent',
    description: 'Lit le site d’un concurrent et propose des posts pour vous démarquer.',
    icon: 'eye',
    prompt: "Surveille le site de mon concurrent et propose 3 posts qui mettent en avant ce qui nous différencie.",
    config: {
      name: 'Surveiller un concurrent',
      goal: "Analyser ce que publie un concurrent et proposer des posts qui montrent notre différence, sans le citer.",
      sources: ['web', 'google_news'],
      keywords: [],
      urls: [],
      platforms: ['linkedin', 'instagram'],
      output: 'drafts',
      postCount: 3,
      schedule: 'weekly',
    },
  },
  {
    id: 'tendances-reddit',
    chip: 'Tendances Reddit',
    title: 'Tendances Reddit',
    description: 'Les discussions qui montent sur Reddit autour de vos sujets.',
    icon: 'reddit',
    prompt: "Trouve les discussions qui montent sur Reddit autour de mes sujets et propose 3 idées de posts.",
    config: {
      name: 'Tendances Reddit',
      goal: "Repérer les questions et débats populaires sur Reddit et y répondre avec des posts.",
      sources: ['reddit'],
      keywords: [],
      urls: [],
      platforms: ['linkedin', 'twitter'],
      output: 'ideas',
      postCount: 3,
      schedule: 'manual',
    },
  },
  {
    id: 'tendances-google',
    chip: 'Tendances Google',
    title: 'Tendances Google',
    description: 'Les recherches en hausse en France, reliées à votre activité.',
    icon: 'trend',
    prompt: "Regarde les recherches en hausse sur Google en France et propose 3 posts qui les relient à mon activité.",
    config: {
      name: 'Tendances Google',
      goal: "Surfer sur les recherches en hausse en France quand elles ont un lien avec mon activité.",
      sources: ['google_trends', 'youtube'],
      keywords: [],
      urls: [],
      platforms: ['instagram', 'facebook'],
      output: 'ideas',
      postCount: 3,
      schedule: 'manual',
    },
  },
  {
    id: 'article-en-posts',
    chip: 'Article → posts',
    title: 'Transformer un article en posts',
    description: 'Une URL de blog devient un post par réseau.',
    icon: 'article',
    prompt: "Lis cet article et transforme-le en un post LinkedIn, un post Instagram et un post X.",
    config: {
      name: 'Article en posts',
      goal: "Transformer un article en posts adaptés à chaque réseau, en gardant les idées clés.",
      sources: ['web'],
      keywords: [],
      urls: [],
      platforms: ['linkedin', 'instagram', 'twitter'],
      output: 'drafts',
      postCount: 3,
      schedule: 'manual',
    },
  },
  {
    id: 'planifier-semaine',
    chip: 'Planifier ma semaine',
    title: 'Planifier ma semaine',
    description: 'Cinq brouillons datés du lundi au vendredi, prêts dans le calendrier.',
    icon: 'calendar',
    prompt: "Prépare ma semaine : 5 posts variés, un par jour du lundi au vendredi, dans mon ton de marque.",
    config: {
      name: 'Planifier ma semaine',
      goal: "Préparer 5 posts variés (conseil, coulisses, question, preuve sociale, actualité) pour la semaine.",
      sources: ['google_news', 'google_trends'],
      keywords: [],
      urls: [],
      platforms: ['linkedin', 'instagram'],
      output: 'drafts',
      postCount: 5,
      schedule: 'weekly',
    },
  },
]

export const SOURCES: AgentSource[] = ['google_news', 'google_trends', 'reddit', 'youtube', 'web']
export const PLATFORMS = ['linkedin', 'instagram', 'facebook', 'twitter'] as const
