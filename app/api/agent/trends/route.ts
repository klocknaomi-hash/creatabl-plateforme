import { NextRequest, NextResponse } from 'next/server'
import { fetchGoogleTrends, fetchRedditTrends, fetchYoutubeTrends, type TrendItem } from '@/lib/agents/sources'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
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

