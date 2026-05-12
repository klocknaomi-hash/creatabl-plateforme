import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID || '1306176321466122'
  
  console.log('=== FACEBOOK OAUTH DEBUG ===')
  console.log('App ID source:', process.env.FACEBOOK_APP_ID ? 'from env' : 'hardcoded fallback')
  console.log('App ID used:', appId)
  console.log('Redirect URI from Env:', process.env.FACEBOOK_REDIRECT_URI)
  console.log('Request origin:', req.nextUrl.origin)

  const state = crypto.randomBytes(16).toString('hex')

  const redirectUri = process.env.FACEBOOK_REDIRECT_URI 
    || `${req.nextUrl.origin}/api/oauth/callback/facebook`
  
  console.log('Final Redirect URI used:', redirectUri)
  console.log('REDIRECT URI USED:', redirectUri)

  const params = new URLSearchParams({
    client_id: appId,
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

  console.log('FULL PARAMS:', params.toString())
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
