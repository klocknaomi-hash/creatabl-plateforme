import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { socialAccounts, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/crypto';

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
          accessToken: encrypt(decrypt(userRecord.facebookAccessToken)),
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
          accessToken: userRecord.facebookAccessToken ? encrypt(decrypt(userRecord.facebookAccessToken)) : null,
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

    // Filter only active accounts
    const { getTrialStatus } = await import('@/lib/trial');
    const trialStatus = getTrialStatus({
      trialStartedAt: userRecord.trialStartedAt,
      trialEndsAt: userRecord.trialEndsAt,
      isSubscribed: userRecord.isSubscribed || false,
    });

    const isTrialActive = trialStatus.status === 'trial';
    const plan = isTrialActive 
      ? 'business' 
      : ((userRecord.plan || userRecord.selectedPlan || 'starter') as string);
    
    const maxAccounts = (plan === 'business' || plan === 'agency') ? 2 : 1;

    // Group accounts by platform to calculate their index
    const platformCounts: Record<string, number> = {};
    const activeAccounts = accounts.filter(account => {
      const platform = account.platform;
      if (!platformCounts[platform]) {
        platformCounts[platform] = 0;
      }
      const index = platformCounts[platform]++;
      return index < maxAccounts;
    });

    return NextResponse.json({ 
      accounts: activeAccounts,
      canvaConnected: !!userRecord.canvaAccessToken
    });
  } catch (error: any) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
