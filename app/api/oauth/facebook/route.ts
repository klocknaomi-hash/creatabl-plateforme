import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const appId = process.env.FACEBOOK_CLIENT_ID
  if (!appId) {
    return Response.json(
      { error: 'Facebook not configured' },
      { status: 500 }
    )
  }

  const state = crypto.randomBytes(16).toString('hex')

  let redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${req.nextUrl.origin}/api/oauth/callback/facebook`
  
  // Fix for Vercel env var corruption where name is included in value
  if (redirectUri.startsWith('FACEBOOK_REDIRECT_URI=')) {
    redirectUri = redirectUri.replace('FACEBOOK_REDIRECT_URI=', '')
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: [
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'business_management',
    ].join(','),
    response_type: 'code',
    state,
  })

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('fb_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  return response
}
