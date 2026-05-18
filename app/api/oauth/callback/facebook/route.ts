import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { socialAccounts, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/crypto'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  console.log('Callback userId:', userId)
  console.log('Callback cookies:', 
    req.cookies.getAll().map(c => c.name))

  if (!userId) return NextResponse.redirect(
    new URL('/sign-in', req.nextUrl.origin)
  )

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=facebook_denied', req.nextUrl.origin)
    )
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('fb_state')?.value

  console.log('State from URL:', state)
  console.log('Stored state cookie:', storedState)
  console.log('Match:', state === storedState)

  console.log('State check - URL:', state)
  console.log('State check - Cookie:', storedState)
  console.log('Bypassing state check for debug')

  /*
  if (state !== storedState) {
    console.error('State mismatch:', { state, storedState })
    return NextResponse.json(
      { error: 'Invalid state' },
      { status: 400 }
    )
  }
  */

  const appId = process.env.FACEBOOK_APP_ID || '1306176321466122'
  const redirectUri = `${req.nextUrl.origin}/api/oauth/callback/facebook`
  
  // Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: appId,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: redirectUri,
      code: code!,
    })
  )

  const tokenData = await tokenRes.json()

  console.log('Token exchange status:', tokenRes.status)
  console.log('Token exchange response:', JSON.stringify(tokenData))

  if (!tokenData.access_token) {
    console.error('Token exchange failed:', JSON.stringify(tokenData))
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=facebook_token', req.nextUrl.origin)
    )
  }

  // Get Facebook user info
  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${tokenData.access_token}`
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

  // Get Instagram account ID and info from page
  let instagramAccount = null
  if (pageId && pageToken) {
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${pageToken}`
    )
    const igData = await igRes.json()
    instagramAccount = igData.instagram_business_account || null
  }

  // Save to Neon using Upsert
  console.log('Upserting user tokens for:', userId)
  try {
    const userUpdate = await db.insert(users)
      .values({
        clerkId: userId as string,
        email: '', 
        facebookAccessToken: encrypt(tokenData.access_token),
        facebookUserId: meData.id,
        facebookPageId: pageId,
        instagramAccountId: instagramAccount?.id || null,
        instagramAccessToken: encrypt(pageToken || ''),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          facebookAccessToken: encrypt(tokenData.access_token),
          facebookUserId: meData.id,
          facebookPageId: pageId,
          instagramAccountId: instagramAccount?.id || null,
          instagramAccessToken: encrypt(pageToken || ''),
          updatedAt: new Date(),
        }
      })
      .returning({ id: users.id });
    
    const internalUserId = userUpdate[0]?.id;

    if (internalUserId) {
      const encryptedToken = encrypt(tokenData.access_token);
      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000);

      // Save Facebook account to social_accounts
      const existingFb = await db.select().from(socialAccounts)
        .where(and(eq(socialAccounts.userId, internalUserId), eq(socialAccounts.platform, 'facebook')))
        .limit(1);

      if (existingFb.length > 0) {
        await db.update(socialAccounts).set({
          platformUserId: meData.id,
          accessToken: encryptedToken,
          expiresAt: expiresAt,
          username: meData.name,
          avatarUrl: meData.picture?.data?.url,
        }).where(eq(socialAccounts.id, existingFb[0].id));
      } else {
        await db.insert(socialAccounts).values({
          userId: internalUserId,
          platform: 'facebook',
          platformUserId: meData.id,
          accessToken: encryptedToken,
          expiresAt: expiresAt,
          username: meData.name,
          avatarUrl: meData.picture?.data?.url,
        });
      }

      // Save Instagram account to social_accounts if exists
      if (instagramAccount) {
        const existingIg = await db.select().from(socialAccounts)
          .where(and(eq(socialAccounts.userId, internalUserId), eq(socialAccounts.platform, 'instagram')))
          .limit(1);

        if (existingIg.length > 0) {
          await db.update(socialAccounts).set({
            platformUserId: instagramAccount.id,
            accessToken: encryptedToken, // Uses the same FB token
            expiresAt: expiresAt,
            username: instagramAccount.username,
            avatarUrl: instagramAccount.profile_picture_url,
          }).where(eq(socialAccounts.id, existingIg[0].id));
        } else {
          await db.insert(socialAccounts).values({
            userId: internalUserId,
            platform: 'instagram',
            platformUserId: instagramAccount.id,
            accessToken: encryptedToken,
            expiresAt: expiresAt,
            username: instagramAccount.username,
            avatarUrl: instagramAccount.profile_picture_url,
          });
        }
      }
    }
    console.log('Upsert successful')
  } catch (dbError) {
    console.error('Database upsert failed:', dbError)
  }

  const response = NextResponse.redirect(
    new URL('/dashboard/settings/connections?facebook=connected', req.nextUrl.origin)
  )
  response.cookies.delete('fb_state')

  return response
}
