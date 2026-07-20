import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { socialAccounts, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { getPlatformClient } from '@/lib/platforms';
import { encrypt } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl.origin));
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('LinkedIn Auth Error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=linkedin_${error}`, req.nextUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/connections?error=no_code', req.nextUrl.origin)
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('linkedin_oauth_state')?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL(
        '/dashboard/accounts?error=invalid_state',
        process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
      )
    );
  }

  try {
    const client = getPlatformClient('linkedin');
    const tokens = await client.getTokens(code);

    // Get internal user ID
    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!userRecord) {
      throw new Error('User not found in database');
    }

    // Encrypt tokens
    const encryptedAccessToken = tokens.accessToken ? encrypt(tokens.accessToken) : null;
    const encryptedRefreshToken = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;

    // Save to social_accounts
    const existing = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userRecord.id),
          eq(socialAccounts.platform, 'linkedin')
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
        userId: userRecord.id,
        platform: 'linkedin',
        platformUserId: tokens.platformUserId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokens.expiresAt,
        username: tokens.username,
        avatarUrl: tokens.avatarUrl,
      });
    }

    const response = NextResponse.redirect(
      new URL('/dashboard/settings/connections?success=true&linkedin=connected', req.nextUrl.origin)
    );
    response.cookies.delete('linkedin_oauth_state');
    return response;

  } catch (err: any) {
    console.error('LinkedIn Callback Error:', err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings/connections?error=${encodeURIComponent(err.message)}`, req.nextUrl.origin)
    );
  }
}
