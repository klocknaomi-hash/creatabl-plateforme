import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(
    new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL!)
  )

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('canva_state')?.value
  const codeVerifier = cookieStore.get('canva_code_verifier')?.value

  // Verify state
  if (state !== storedState) {
    return NextResponse.json(
      { error: 'Invalid state' },
      { status: 400 }
    )
  }

  // Exchange code for token
  const tokenResponse = await fetch(
    'https://www.canva.com/api/oauth/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    return NextResponse.json(
      { error: 'Token exchange failed', details: tokenData },
      { status: 400 }
    )
  }

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

  // Save tokens to Neon
  await db.update(users)
    .set({
      canvaAccessToken: tokenData.access_token,
      canvaRefreshToken: tokenData.refresh_token,
      canvaTokenExpiresAt: expiresAt,
    })
    .where(eq(users.clerkId, userId))

  // Clear cookies
  const response = NextResponse.redirect(
    new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!)
  )
  response.cookies.delete('canva_code_verifier')
  response.cookies.delete('canva_state')

  return response
}
