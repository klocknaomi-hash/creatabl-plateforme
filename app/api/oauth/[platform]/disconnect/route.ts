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
    await db
      .delete(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, user.id),
          eq(socialAccounts.platform, platform as any)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Disconnect error for ${platform}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
