import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let accountId: string | null = null;
    try {
      const body = await request.json().catch(() => null);
      if (body && body.accountId) {
        accountId = body.accountId;
      }
    } catch (e) {}

    if (!accountId) {
      const searchParams = request.nextUrl.searchParams;
      accountId = searchParams.get('accountId');
    }

    if (accountId) {
      // Find the account first to verify ownership and platform
      const account = await db.query.socialAccounts.findFirst({
        where: and(
          eq(socialAccounts.id, accountId),
          eq(socialAccounts.userId, user.id)
        )
      });
      if (account) {
        await db.delete(socialAccounts).where(eq(socialAccounts.id, accountId));
        
        // Also clean up legacy columns in users table if this was the last account for this platform
        if (account.platform === 'facebook') {
          const remainingFbs = await db.select().from(socialAccounts).where(and(eq(socialAccounts.userId, user.id), eq(socialAccounts.platform, 'facebook')));
          if (remainingFbs.length === 0) {
            const { users } = await import('@/lib/db/schema');
            await db.update(users)
              .set({ 
                facebookAccessToken: null, 
                facebookUserId: null, 
                facebookPageId: null 
              })
              .where(eq(users.id, user.id));
          }
        } else if (account.platform === 'instagram') {
          const remainingIgs = await db.select().from(socialAccounts).where(and(eq(socialAccounts.userId, user.id), eq(socialAccounts.platform, 'instagram')));
          if (remainingIgs.length === 0) {
            const { users } = await import('@/lib/db/schema');
            await db.update(users)
              .set({ 
                instagramAccountId: null,
                instagramAccessToken: null,
              })
              .where(eq(users.id, user.id));
          }
        }
      }
    } else {
      // Legacy fallback: disconnect all accounts for this platform
      if (platform === 'facebook' || platform === 'instagram') {
        const { users } = await import('@/lib/db/schema');
        if (platform === 'facebook') {
          await db.update(users)
            .set({ 
              facebookAccessToken: null, 
              facebookUserId: null, 
              facebookPageId: null 
            })
            .where(eq(users.id, user.id));
        } else {
          await db.update(users)
            .set({ 
              instagramAccountId: null,
              instagramAccessToken: null,
            })
            .where(eq(users.id, user.id));
        }
        await db.delete(socialAccounts).where(
          and(
            eq(socialAccounts.userId, user.id),
            eq(socialAccounts.platform, platform as any)
          )
        );
      } else if (platform === 'canva') {
        const { users } = await import('@/lib/db/schema');
        await db.update(users)
          .set({ 
            canvaAccessToken: null,
            canvaRefreshToken: null,
            canvaTokenExpiresAt: null,
          })
          .where(eq(users.id, user.id));
      } else {
        await db
          .delete(socialAccounts)
          .where(
            and(
              eq(socialAccounts.userId, user.id),
              eq(socialAccounts.platform, platform as any)
            )
          );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Disconnect error for ${platform}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
