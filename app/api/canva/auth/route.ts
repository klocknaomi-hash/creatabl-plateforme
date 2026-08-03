import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const codeVerifier = crypto
    .randomBytes(64)
    .toString('base64url')

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.CANVA_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.CANVA_REDIRECT_URI!,
    scope: [
      'design:content:read',
      'design:content:write',
      'design:meta:read',
      'asset:read',
      'asset:write',
      'profile:read'
    ].join(' '),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  })

  const { searchParams } = new URL(req.url)
  const returnTo = searchParams.get('returnTo') || '/dashboard/settings/connections?success=true'
  const isPopup = searchParams.get('popup') === 'true'

  const authUrl = `https://www.canva.com/api/oauth/authorize?${params}`

  const response = NextResponse.redirect(authUrl)

  response.cookies.set('canva_return_to', returnTo, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  response.cookies.set('canva_is_popup', isPopup ? 'true' : 'false', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  response.cookies.set('canva_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })
  response.cookies.set('canva_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  })

  return response
}
