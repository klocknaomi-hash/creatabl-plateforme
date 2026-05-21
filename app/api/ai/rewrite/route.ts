import { NextRequest, NextResponse } from 'next/server';
import { rewriteCaption } from '@/lib/gemini';
import { auth } from '@clerk/nextjs/server';
import { getAccess } from '@/lib/get-access';
import { checkAiRateLimit } from '@/lib/ai-rate-limit';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access = await getAccess();
  if (!access.aiReformulate) {
    return Response.json(
      { error: 'Reformuler nécessite le plan Pro ou supérieur.' },
      { status: 403 }
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  let planName = (user?.plan || user?.selectedPlan || 'starter').toLowerCase();
  if (planName === 'free') planName = 'starter';
  if (planName === 'agency') planName = 'business';
  const plan = (['starter', 'pro', 'business'].includes(planName) ? planName : 'starter') as 'starter' | 'pro' | 'business';

  const rateLimit = await checkAiRateLimit(userId, plan);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: rateLimit.message,
        retryAt: rateLimit.retryAt,
      },
      { status: 429 }
    );
  }

  try {
    const { caption, tone } = await request.json();
    if (!caption) {
      return NextResponse.json({ error: 'Caption is required' }, { status: 400 });
    }

    const rewritten = await rewriteCaption(caption, tone || 'professional');
    return NextResponse.json({ rewritten });
  } catch (error: any) {
    console.error('AI Rewrite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
