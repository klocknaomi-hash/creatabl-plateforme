import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { socialAccounts, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/crypto'

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
      new URL('/dashboard/settings/connections?error=facebook_denied', req.nextUrl.origin)
    )
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get('fb_state')?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL(
        '/dashboard/settings/connections?error=invalid_state',
        process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
      )
    )
  }

  const appId = process.env.FACEBOOK_CLIENT_ID
  if (!appId) {
    return Response.json(
      { error: 'Facebook not configured' },
      { status: 500 }
    )
  }

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
  try {
    const userUpdate = await db.insert(users)
      .values({
        clerkId: userId as string,
        email: '', 
        facebookAccessToken: encrypt(tokenData.access_token),
        facebookUserId: meData.id,
        facebookPageId: pageId,
        instagramAccountId: instagramAccount?.id || null,
        instagramAccessToken: pageToken ? encrypt(pageToken) : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          facebookAccessToken: encrypt(tokenData.access_token),
          facebookUserId: meData.id,
          facebookPageId: pageId,
          instagramAccountId: instagramAccount?.id || null,
          instagramAccessToken: pageToken ? encrypt(pageToken) : null,
          updatedAt: new Date(),
        }
      })
      .returning({ id: users.id });
    
    const internalUserId = userUpdate[0]?.id;

    if (internalUserId) {
      const encryptedToken = encrypt(tokenData.access_token);
      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000);

      const { checkPlanLimit } = await import('@/lib/plans/check-limit');

      // Save Facebook account to social_accounts
      const existingFb = await db.select().from(socialAccounts)
        .where(and(eq(socialAccounts.userId, internalUserId), eq(socialAccounts.platform, 'facebook')));

      const existingMatchFb = existingFb.find(a => a.platformUserId === meData.id);

      if (existingMatchFb) {
        await db.update(socialAccounts).set({
          accessToken: encryptedToken,
          expiresAt: expiresAt,
          username: meData.name,
          avatarUrl: meData.picture?.data?.url,
        }).where(eq(socialAccounts.id, existingMatchFb.id));
      } else {
        const limitResult = await checkPlanLimit(userId as string, 'connectedAccounts');
        if (limitResult.allowed) {
          await db.insert(socialAccounts).values({
            userId: internalUserId,
            platform: 'facebook',
            platformUserId: meData.id,
            accessToken: encryptedToken,
            expiresAt: expiresAt,
            username: meData.name,
            avatarUrl: meData.picture?.data?.url,
          });
        } else {
          return NextResponse.redirect(
            new URL('/dashboard/settings/connections?error=limit_reached&limit=connectedAccounts&upgradeUrl=%2Fpricing', req.nextUrl.origin)
          );
        }
      }

      // Save Instagram account to social_accounts if exists
      if (instagramAccount) {
        const existingIg = await db.select().from(socialAccounts)
          .where(and(eq(socialAccounts.userId, internalUserId), eq(socialAccounts.platform, 'instagram')));

        const existingMatchIg = existingIg.find(a => a.platformUserId === instagramAccount.id);

        if (existingMatchIg) {
          await db.update(socialAccounts).set({
            accessToken: encryptedToken, // Uses the same FB token
            expiresAt: expiresAt,
            username: instagramAccount.username,
            avatarUrl: instagramAccount.profile_picture_url,
          }).where(eq(socialAccounts.id, existingMatchIg.id));
        } else {
          const limitResult = await checkPlanLimit(userId as string, 'connectedAccounts');
          if (limitResult.allowed) {
            await db.insert(socialAccounts).values({
              userId: internalUserId,
              platform: 'instagram',
              platformUserId: instagramAccount.id,
              accessToken: encryptedToken,
              expiresAt: expiresAt,
              username: instagramAccount.username,
              avatarUrl: instagramAccount.profile_picture_url,
            });
          } else {
            return NextResponse.redirect(
              new URL('/dashboard/settings/connections?error=limit_reached&limit=connectedAccounts&upgradeUrl=%2Fpricing', req.nextUrl.origin)
            );
          }
        }
      }
    }
  } catch (dbError) {
    console.error('Database upsert failed:', dbError)
  }

  const response = NextResponse.redirect(
    new URL('/dashboard/settings/connections?facebook=connected', req.nextUrl.origin)
  )
  response.cookies.delete('fb_state')

  return response
}
