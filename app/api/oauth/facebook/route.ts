import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  console.log('=== FACEBOOK OAUTH DEBUG ===')
  console.log('App ID:', process.env.FACEBOOK_APP_ID)
  console.log('Redirect URI from Env:', process.env.FACEBOOK_REDIRECT_URI)
  console.log('Request origin:', req.nextUrl.origin)

  const state = crypto.randomBytes(16).toString('hex')

  const redirectUri = process.env.FACEBOOK_REDIRECT_URI 
    || `${req.nextUrl.origin}/api/oauth/callback/facebook`
  
  console.log('Final Redirect URI used:', redirectUri)

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: redirectUri,
    scope: [
      'email',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
    ].join(','),
    response_type: 'code',
    state,
  })

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  console.log('Full auth URL:', authUrl)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('fb_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  return response
}
