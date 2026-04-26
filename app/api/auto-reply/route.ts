import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { autoReplyRules, users as usersTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { checkPlanLimit } from '@/lib/plan-limits';

export async function GET(request: NextRequest) {
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
    const rules = await db.query.autoReplyRules.findMany({
      where: eq(autoReplyRules.userId, userRecord.id),
      with: {
        socialAccount: true,
        logs: {
          limit: 5,
          orderBy: (logs, { desc }) => [desc(logs.createdAt)]
        }
      }
    });

    return NextResponse.json({ 
      rules,
      userPlan: userRecord.plan
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  // Feature gate: check plan limits
  const { allowed, current, limit } = await checkPlanLimit(clerkId, 'autoReplyRules');
  if (!allowed) {
    return NextResponse.json({ 
      error: `Auto-reply rule limit reached. You have used ${current} of ${limit} rules. Upgrade to Pro for more.`,
      limitReached: true
    }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { 
      socialAccountId, 
      triggerType, 
      keywords, 
      replyTemplate, 
      useAi, 
      aiContext, 
      tone, 
      approvalMode 
    } = body;

    if (!socialAccountId || !triggerType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (triggerType === 'keyword' && (!keywords || !keywords.length)) {
      return NextResponse.json({ error: 'Keywords are required for keyword match' }, { status: 400 });
    }

    const [newRule] = await db.insert(autoReplyRules).values({
      userId: userRecord.id,
      socialAccountId,
      triggerType,
      keywords: keywords || [],
      replyTemplate,
      useAi: useAi || false,
      aiContext,
      tone: tone || 'Friendly',
      approvalMode: approvalMode || 'auto',
      isActive: true,
    }).returning();

    return NextResponse.json({ success: true, rule: newRule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
