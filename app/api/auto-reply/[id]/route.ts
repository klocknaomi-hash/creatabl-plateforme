import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { autoReplyRules, users as usersTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });

  if (!userRecord) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { id } = params;

    const [updatedRule] = await db.update(autoReplyRules)
      .set({ ...body })
      .where(and(
        eq(autoReplyRules.id, id),
        eq(autoReplyRules.userId, userRecord.id)
      ))
      .returning();

    if (!updatedRule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule: updatedRule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });

  if (!userRecord) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const { id } = params;

    const [deletedRule] = await db.delete(autoReplyRules)
      .where(and(
        eq(autoReplyRules.id, id),
        eq(autoReplyRules.userId, userRecord.id)
      ))
      .returning();

    if (!deletedRule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
