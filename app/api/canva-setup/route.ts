import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'canva-check-secret-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: any = { dbUsers: [], clerkUsers: [] };

  try {
    const dbUsers = await db.select().from(users);
    results.dbUsers = dbUsers.map(u => ({
      clerkId: u.clerkId,
      email: u.email,
      plan: u.plan,
      subscriptionStatus: u.subscriptionStatus,
      onboardingCompleted: u.onboardingCompleted,
    }));
  } catch (err: any) {
    results.dbError = err.message || err;
  }

  try {
    const client = await clerkClient();
    const clerkUsersList = await client.users.getUserList();
    results.clerkUsers = clerkUsersList.data.map(u => ({
      id: u.id,
      emails: u.emailAddresses.map(e => e.emailAddress),
      publicMetadata: u.publicMetadata,
      passwordEnabled: u.passwordEnabled,
    }));
  } catch (err: any) {
    results.clerkError = err.message || err;
  }

  return NextResponse.json(results);
}
