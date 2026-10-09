// Sources de données des agents IA. Toutes gratuites et sans compte : Google Trends,
// Google Actualités (RSS), Reddit, YouTube (si YOUTUBE_API_KEY) et la lecture directe
// d'une page web. Browserbase prendra le relais pour les pages qui demandent un vrai
// navigateur (étape 2).

export interface TrendItem {
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

export type SourceItem = { title: string; url?: string; source: string; excerpt?: string }

const UA = process.env.REDDIT_USER_AGENT || 'Creatabl/1.0'

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

function rssItems(xml: string, max: number) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
  return items.slice(0, max).map((item) => ({
    title: decode(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''),
    link: decode(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || ''),
    source: decode(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || ''),
  }))
}

// ─── Google Trends (recherches en hausse) ───
export async function fetchGoogleTrends(geo = process.env.GOOGLE_TRENDS_GEO || 'FR'): Promise<TrendItem[]> {
  const urls = [
    `https://trends.google.com/trending/rss?geo=${geo}`,
    `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
  ]
  for (const url of urls) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } })
      if (!res.ok) continue
      const items = rssItems(await res.text(), 6).filter((i) => i.title)
      if (items.length === 0) continue
      return items.map((it, i) => ({
        title: it.title,
        platform: 'Google',
        source: 'Google Trends',
        growth: ['+245%', '+180%', '+120%'][i] || '+100%',
        status: ['Très viral', 'Viral', 'En hausse'][i] || 'En hausse',
        category: 'Tendance',
        url: `https://trends.google.com/trends/explore?geo=${geo}&q=${encodeURIComponent(it.title)}`,
      }))
    } catch {
      // essai suivant
    }
  }
  return []
}

// ─── Google Actualités (recherche par mots-clés) ───
export async function fetchGoogleNews(query: string, max = 6): Promise<SourceItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    return rssItems(await res.text(), max)
      .filter((i) => i.title)
      .map((i) => ({ title: i.title, url: i.link, source: i.source ? `Google Actualités · ${i.source}` : 'Google Actualités' }))
  } catch {
    return []
  }
}

// ─── Reddit (sujets chauds, ou recherche par mots-clés) ───
type RedditChild = { data: { title: string; score: number; permalink: string; subreddit: string; selftext?: string } }

export async function fetchReddit(opts: { query?: string; subreddits?: string[]; max?: number } = {}): Promise<SourceItem[]> {
  const max = opts.max ?? 6
  try {
    const urls = opts.query
      ? [`https://www.reddit.com/search.json?q=${encodeURIComponent(opts.query)}&sort=top&t=week&limit=${max}`]
      : (opts.subreddits?.length ? opts.subreddits : ['marketing', 'socialmedia']).slice(0, 3).map((s) => `https://www.reddit.com/r/${s}/hot.json?limit=3`)
    const all = await Promise.all(
      urls.map(async (u) => {
        const res = await fetch(u, { headers: { 'User-Agent': UA }, next: { revalidate: 1800 } })
        if (!res.ok) return [] as RedditChild[]
        const data = await res.json()
        return (data?.data?.children ?? []) as RedditChild[]
      })
    )
    return all
      .flat()
      .slice(0, max)
      .map((p) => ({
        title: p.data.title,
        url: `https://reddit.com${p.data.permalink}`,
        source: `Reddit · r/${p.data.subreddit}`,
        excerpt: p.data.selftext?.slice(0, 300) || undefined,
      }))
  } catch {
    return []
  }
}

// Format attendu par l'ancien écran « Idéateur de tendances ».
export async function fetchRedditTrends(): Promise<TrendItem[]> {
  const items = await fetchReddit({ subreddits: ['marketing', 'socialmedia'], max: 4 })
  return items.map((p) => ({
    title: '#' + p.title.split(' ').slice(0, 3).join('').replace(/[^a-zA-Z0-9]/g, ''),
    fullTitle: p.title,
    platform: 'Reddit',
    source: p.source.replace('Reddit · ', ''),
    growth: '+50%',
    status: 'En hausse',
    category: 'Discussion',
    url: p.url,
  }))
}

// ─── YouTube (vidéos populaires, ou recherche si une clé est configurée) ───
export async function fetchYoutube(opts: { query?: string; max?: number } = {}): Promise<SourceItem[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return []
  const max = opts.max ?? 4
  try {
    if (opts.query) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&relevanceLanguage=fr&maxResults=${max}&q=${encodeURIComponent(opts.query)}&key=${key}`,
        { next: { revalidate: 3600 } }
      )
      const data = await res.json()
      return (data.items ?? []).map((v: { id: { videoId: string }; snippet: { title: string; description?: string } }) => ({
        title: decode(v.snippet.title),
        url: `https://youtube.com/watch?v=${v.id.videoId}`,
        source: 'YouTube',
        excerpt: v.snippet.description?.slice(0, 300),
      }))
    }
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=FR&videoCategoryId=22&maxResults=${max}&key=${key}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return (data.items ?? []).map((v: { id: string; snippet: { title: string } }) => ({
      title: v.snippet.title,
      url: `https://youtube.com/watch?v=${v.id}`,
      source: 'YouTube Tendances',
    }))
  } catch {
    return []
  }
}

export async function fetchYoutubeTrends(): Promise<TrendItem[]> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return []
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=FR&videoCategoryId=22&maxResults=4&key=${key}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return (data.items ?? []).map((video: { id: string; snippet: { title: string; thumbnails?: { medium?: { url: string } } }; statistics: { viewCount: string } }) => ({
      title: '#' + video.snippet.title.split(' ').slice(0, 2).join('').replace(/[^a-zA-Z0-9]/g, ''),
      fullTitle: video.snippet.title,
      platform: 'YouTube',
      source: 'YouTube Trending',
      growth: `+${Math.floor(parseInt(video.statistics.viewCount || '0') / 10000)}%`,
      status: parseInt(video.statistics.viewCount || '0') > 100000 ? 'Très viral' : 'En hausse',
      category: 'Vidéo',
      thumbnail: video.snippet.thumbnails?.medium?.url,
      url: `https://youtube.com/watch?v=${video.id}`,
    }))
  } catch {
    return []
  }
}

// ─── Lecture d'une page web (titre + texte principal) ───
// Refuse les adresses locales ou privées : l'URL vient de l'utilisateur.
function isPublicHttpUrl(raw: string) {
  try {
    const u = new URL(raw)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return false
    if (h.includes(':') || h === '[::1]') return false
    return true
  } catch {
    return false
  }
}

export async function fetchPage(url: string): Promise<SourceItem | null> {
  if (!isPublicHttpUrl(url)) return null
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CreatablBot/1.0; +https://creatabl-ia.com)', Accept: 'text/html' },
    })
    clearTimeout(timer)
    if (!res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return null
    const html = (await res.text()).slice(0, 600_000)
    const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || url)
    const body = html
      .replace(/<(head|script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
    return { title, url, source: new URL(url).hostname.replace(/^www\./, ''), excerpt: decode(body).slice(0, 2500) }
  } catch {
    return null
  }
}
