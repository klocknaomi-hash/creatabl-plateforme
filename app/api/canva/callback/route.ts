import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/crypto'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(
      new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('Canva OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=${encodeURIComponent(error)}`,
        process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('canva_state')?.value
  const codeVerifier =
    cookieStore.get('canva_code_verifier')?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=invalid_state',
        process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const tokenResponse = await fetch(
    'https://api.canva.com/rest/v1/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code!,
        redirect_uri: process.env.CANVA_REDIRECT_URI!,
        client_id: process.env.CANVA_CLIENT_ID!,
        client_secret: process.env.CANVA_CLIENT_SECRET!,
        code_verifier: codeVerifier!,
      }),
    }
  )

  const tokenData = await tokenResponse.json()

  if (!tokenData.access_token) {
    console.error('Token exchange failed:', tokenData)
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=token_error',
        process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  const expiresAt = new Date(
    Date.now() + tokenData.expires_in * 1000
  )

  await db.update(users)
    .set({
      canvaAccessToken: encrypt(tokenData.access_token),
      canvaRefreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
      canvaTokenExpiresAt: expiresAt,
    })
    .where(eq(users.clerkId, userId))

  const response = NextResponse.redirect(
    new URL('/dashboard/settings/connections?success=true',
      process.env.NEXT_PUBLIC_APP_URL!)
  )
  response.cookies.delete('canva_code_verifier')
  response.cookies.delete('canva_state')

  return response
}
