import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  console.log('Initiating Facebook OAuth from:', req.nextUrl.origin)
  console.log('FACEBOOK_APP_ID loaded:',
    process.env.FACEBOOK_APP_ID ? 'YES' : 'MISSING')
  console.log('Using App ID:', process.env.FACEBOOK_APP_ID)
  console.log('App ID value:',
    process.env.FACEBOOK_APP_ID?.substring(0, 6) + '...')

  const state = crypto.randomBytes(16).toString('hex')

  const redirectUri = `${req.nextUrl.origin}/api/oauth/callback/facebook`
  
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

  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth?${params}`

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('fb_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  return response
}
