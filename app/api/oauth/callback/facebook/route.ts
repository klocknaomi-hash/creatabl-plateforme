import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(
    new URL('/sign-in', req.nextUrl.origin)
  )

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=facebook_denied', req.nextUrl.origin)
    )
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('fb_state')?.value

  if (state !== storedState) {
    return NextResponse.json(
      { error: 'Invalid state' },
      { status: 400 }
    )
  }

  const redirectUri = `${req.nextUrl.origin}/api/oauth/callback/facebook`
  
  // Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: redirectUri,
      code: code!,
    })
  )

  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=facebook_token', req.nextUrl.origin)
    )
  }

  // Get Facebook user ID
  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me?access_token=${tokenData.access_token}`
  )
  const meData = await meRes.json()

  // Get Instagram account linked to Facebook page
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${tokenData.access_token}`
  )
  const pagesData = await pagesRes.json()
  const page = pagesData.data?.[0]
  const pageId = page?.id || null
  const pageToken = page?.access_token || null

  // Get Instagram account ID from page
  let instagramAccountId = null
  if (pageId && pageToken) {
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
    )
    const igData = await igRes.json()
    instagramAccountId =
      igData.instagram_business_account?.id || null
  }

  // Save to Neon
  console.log('Updating user tokens for:', userId)
  await db.update(users)
    .set({
      facebookAccessToken: tokenData.access_token,
      facebookUserId: meData.id,
      facebookPageId: pageId,
      instagramAccountId,
      instagramAccessToken: pageToken,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, userId))
  console.log('Update successful')

  const response = NextResponse.redirect(
    new URL('/dashboard/accounts?facebook=connected', req.nextUrl.origin)
  )
  response.cookies.delete('fb_state')

  return response
}
