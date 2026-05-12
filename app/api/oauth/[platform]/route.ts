import { NextRequest, NextResponse } from 'next/server'
import { getPlatformClient } from '@/lib/platforms'
import crypto from 'crypto'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const baseUrl = req.nextUrl.origin

  // Special handling for Facebook/Instagram which use the users table
  if (platform.toLowerCase() === 'facebook' || platform.toLowerCase() === 'instagram') {
    return NextResponse.redirect(
      new URL('/api/oauth/facebook', baseUrl)
    )
  }

  try {
    const client = getPlatformClient(platform.toLowerCase())
    const state = crypto.randomBytes(16).toString('hex')
    
    const authUrlData = await client.getAuthorizationUrl({ state })
    const authUrl = typeof authUrlData === 'string' ? authUrlData : authUrlData.url

    const response = NextResponse.redirect(authUrl)
    
    // Store state in cookie for validation in callback
    response.cookies.set(`${platform.toLowerCase()}_oauth_state`, state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })

    // Special handling for Twitter PKCE
    if (platform.toLowerCase() === 'twitter' || platform.toLowerCase() === 'x') {
      if (typeof authUrlData !== 'string' && authUrlData.codeVerifier) {
        response.cookies.set('twitter_code_verifier', authUrlData.codeVerifier, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 600,
        })
      }
    }

    return response
  } catch (error: any) {
    console.error(`OAuth Initiation Error for ${platform}:`, error)
    return NextResponse.json(
      { error: `Failed to initiate OAuth for ${platform}: ${error.message}` },
      { status: 400 }
    )
  }
}
