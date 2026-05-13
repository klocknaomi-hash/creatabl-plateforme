import { NextRequest, NextResponse } from 'next/server';
import { getPlatformClient } from '@/lib/platforms';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { encryptToken } from '@/lib/encryption';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code') || searchParams.get('oauth_token');
  const oauthVerifier = searchParams.get('oauth_verifier');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/settings/connections?error=${error}`, request.nextUrl.origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings/connections?error=no_code', request.nextUrl.origin));
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.nextUrl.origin));
  }

  try {
    const client = getPlatformClient(platform);
    const cookieStore = await cookies();
    
    // Validate state
    const state = searchParams.get('state');
    const storedState = cookieStore.get(`${platform}_oauth_state`)?.value;
    
    if (state || storedState) {
      if (!storedState || state !== storedState) {
        console.error(`[OAuth Debug] State Mismatch for ${platform}:`, {
          receivedState: state,
          storedState: storedState || 'MISSING',
          allCookies: cookieStore.getAll().map(c => c.name),
          url: request.url,
          userAgent: request.headers.get('user-agent'),
          protocol: request.headers.get('x-forwarded-proto') || 'http',
        });
        // Clear state cookie even on failure to prevent replay
        cookieStore.delete(`${platform}_oauth_state`);
        return NextResponse.redirect(new URL(`/dashboard/settings/connections?error=invalid_state&platform=${platform}`, request.nextUrl.origin));
      }
      // Clear state cookie on success
      cookieStore.delete(`${platform}_oauth_state`);
    }

    let tokens;

    if (platform === 'twitter') {
      const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;
      cookieStore.delete('twitter_code_verifier');
      
      if (!codeVerifier) {
        throw new Error('Missing code verifier');
      }
      tokens = await client.getTokens(code, codeVerifier);
    } else {
      tokens = await client.getTokens(code);
    }

    // Encrypt tokens
    const encryptedAccessToken = tokens.accessToken ? encryptToken(tokens.accessToken) : null;
    const encryptedRefreshToken = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;

    // Check if account already exists for this platform and user
    const existing = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, user.id),
          eq(socialAccounts.platform, platform as any)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(socialAccounts)
        .set({
          platformUserId: tokens.platformUserId,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: tokens.expiresAt,
          username: tokens.username,
          avatarUrl: tokens.avatarUrl,
        })
        .where(eq(socialAccounts.id, existing[0].id));
    } else {
      await db.insert(socialAccounts).values({
        userId: user.id,
        platform: platform as any,
        platformUserId: tokens.platformUserId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokens.expiresAt,
        username: tokens.username,
        avatarUrl: tokens.avatarUrl,
      });
    }

    return NextResponse.redirect(new URL('/dashboard/settings/connections?success=true', request.nextUrl.origin));
  } catch (err: any) {
    console.error(`Callback error for ${platform}:`, err);
    return NextResponse.redirect(new URL(`/dashboard/settings/connections?error=${encodeURIComponent(err.message)}`, request.nextUrl.origin));
  }
}
