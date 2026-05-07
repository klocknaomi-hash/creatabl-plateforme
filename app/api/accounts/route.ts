import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { socialAccounts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    const accounts = await db.query.socialAccounts.findMany({
      where: eq(socialAccounts.userId, userRecord.id),
    });

    return NextResponse.json({ 
      accounts,
      canvaConnected: !!userRecord.canvaAccessToken
    });
  } catch (error: any) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
