import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { socialAccounts, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { encryptToken } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let accounts = await db.query.socialAccounts.findMany({
      where: eq(socialAccounts.userId, userRecord.id),
    });

    // Migrate "legacy" connections in users table if they are not in socialAccounts
    let needsRefetch = false;

    if (userRecord.facebookAccessToken && !accounts.some(a => a.platform === 'facebook')) {
      try {
        await db.insert(socialAccounts).values({
          userId: userRecord.id,
          platform: 'facebook',
          platformUserId: userRecord.facebookUserId,
          accessToken: encryptToken(userRecord.facebookAccessToken),
          username: userRecord.name || 'Facebook User',
        });
        needsRefetch = true;
      } catch (err) {
        console.error('Failed to migrate legacy Facebook account:', err);
      }
    }

    if (userRecord.instagramAccountId && !accounts.some(a => a.platform === 'instagram')) {
      try {
        await db.insert(socialAccounts).values({
          userId: userRecord.id,
          platform: 'instagram',
          platformUserId: userRecord.instagramAccountId,
          accessToken: userRecord.facebookAccessToken ? encryptToken(userRecord.facebookAccessToken) : null,
          username: userRecord.name || 'Instagram User',
        });
        needsRefetch = true;
      } catch (err) {
        console.error('Failed to migrate legacy Instagram account:', err);
      }
    }

    if (needsRefetch) {
      accounts = await db.query.socialAccounts.findMany({
        where: eq(socialAccounts.userId, userRecord.id),
      });
    }

    return NextResponse.json({ 
      accounts,
      canvaConnected: !!userRecord.canvaAccessToken
    });
  } catch (error: any) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
