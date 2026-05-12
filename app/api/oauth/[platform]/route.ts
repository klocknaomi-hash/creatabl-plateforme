import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

  switch (platform.toLowerCase()) {
    case 'facebook':
    case 'instagram':
      return NextResponse.redirect(
        new URL('/api/oauth/facebook', baseUrl)
      )

    case 'linkedin':
      return NextResponse.redirect(
        new URL('/api/oauth/linkedin', baseUrl)
      )

    case 'twitter':
    case 'x':
      return NextResponse.redirect(
        new URL('/api/oauth/twitter', baseUrl)
      )

    case 'youtube':
      return NextResponse.redirect(
        new URL('/api/oauth/youtube', baseUrl)
      )

    case 'tiktok':
      return NextResponse.redirect(
        new URL('/api/oauth/tiktok', baseUrl)
      )

    default:
      return NextResponse.json(
        { error: `Platform not supported: ${platform}` },
        { status: 400 }
      )
  }
}
