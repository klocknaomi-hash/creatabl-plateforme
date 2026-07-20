import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

export async function GET(req: NextRequest) {
  const geo = process.env.GOOGLE_TRENDS_GEO || 'FR'

  const [googleTrends, redditTrends, youtubeTrends] =
    await Promise.allSettled([
      fetchGoogleTrends(geo),
      fetchRedditTrends(),
      fetchYoutubeTrends(),
    ])

  const trends: TrendItem[] = [
    ...(googleTrends.status === 'fulfilled'
      ? googleTrends.value : []),
    ...(redditTrends.status === 'fulfilled'
      ? redditTrends.value : []),
    ...(youtubeTrends.status === 'fulfilled'
      ? youtubeTrends.value : []),
  ]

  return NextResponse.json({
    trends: trends.filter((item): item is TrendItem => Boolean(item && item.title)).slice(0, 12),
    sources: ['Google Trends', 'Reddit', 'YouTube'],
    updatedAt: new Date().toISOString(),
  })
}

// ─── Google Trends ───
async function fetchGoogleTrends(geo: string): Promise<TrendItem[]> {
  try {
    const res = await fetch(
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`,
      { next: { revalidate: 3600 } }
    )
    const xml = await res.text()
    const titles = xml.match(
      /<title><!\[CDATA\[(.*?)\]\]><\/title>/g
    ) || []

    return titles.slice(1, 4).map((t, i) => ({
      title: t.replace(
        /<title><!\[CDATA\[|\]\]><\/title>/g, ''
      ),
      platform: 'Google',
      source: 'Google Trends',
      growth: ['+245%', '+180%', '+120%'][i] || '+100%',
      status: ['Très viral', 'Viral', 'En hausse'][i] || 'En hausse',
      category: 'Tendance',
    }))
  } catch {
    return []
  }
}

// ─── Reddit ───
async function fetchRedditTrends(): Promise<TrendItem[]> {
  try {
    const subreddits = [
      'marketing',
      'socialmedia',
      'entrepreneur',
      'contentcreation',
    ]

    const results = await Promise.all(
      subreddits.slice(0, 2).map(async sub => {
        const res = await fetch(
          `https://www.reddit.com/r/${sub}/hot.json?limit=3`,
          {
            headers: {
              'User-Agent': process.env.REDDIT_USER_AGENT
                || 'Creatabl/1.0',
            },
            next: { revalidate: 3600 },
          }
        )
        const data = await res.json()
        const posts: TrendItem[] = data.data?.children?.map(
          (post: { data: { title: string; score: number; permalink: string } }) => ({
            title: '#' + post.data.title
              .split(' ')
              .slice(0, 3)
              .join('')
              .replace(/[^a-zA-Z0-9]/g, ''),
            fullTitle: post.data.title,
            platform: 'Reddit',
            source: `r/${sub}`,
            growth: `+${post.data.score
              .toString()
              .slice(0, 2)}%`,
            status: post.data.score > 1000
              ? 'Viral' : 'En hausse',
            category: 'Discussion',
            url: `https://reddit.com${post.data.permalink}`,
          })
        ) || []
        return posts
      })
    )

    return results.flat().filter((item): item is TrendItem => Boolean(item)).slice(0, 4)
  } catch {
    return []
  }
}

// ─── YouTube ───
async function fetchYoutubeTrends(): Promise<TrendItem[]> {
  try {
    if (!process.env.YOUTUBE_API_KEY) return []

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics` +
      `&chart=mostPopular` +
      `&regionCode=FR` +
      `&videoCategoryId=22` +
      `&maxResults=4` +
      `&key=${process.env.YOUTUBE_API_KEY}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()

    const videos: TrendItem[] = data.items?.map((video: {
      id: string;
      snippet: { title: string; thumbnails?: { medium?: { url: string } } };
      statistics: { viewCount: string };
    }) => ({
      title: '#' + video.snippet.title
        .split(' ')
        .slice(0, 2)
        .join('')
        .replace(/[^a-zA-Z0-9]/g, ''),
      fullTitle: video.snippet.title,
      platform: 'YouTube',
      source: 'YouTube Trending',
      growth: `+${Math.floor(
        parseInt(video.statistics.viewCount || '0') / 10000
      )}%`,
      status: parseInt(video.statistics.viewCount || '0')
        > 100000 ? 'Très viral' : 'En hausse',
      category: 'Vidéo',
      thumbnail: video.snippet.thumbnails?.medium?.url,
      url: `https://youtube.com/watch?v=${video.id}`,
    })) || []
    return videos
  } catch {
    return []
  }
}
