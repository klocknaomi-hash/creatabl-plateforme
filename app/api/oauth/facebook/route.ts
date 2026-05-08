import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
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
