import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePost } from '@/lib/ai-provider';
import { db } from '@/lib/db';
import { aiLogs, users } from '@/lib/db/schema';
import { getAccess } from '@/lib/get-access';
import { checkAiRateLimit } from '@/lib/ai-rate-limit';
import { eq, sql } from 'drizzle-orm';
import { checkPlanLimit } from '@/lib/plans/check-limit';
import { checkActiveAccess } from '@/lib/plans/check-active';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check active trial or subscription
  const activeCheck = await checkActiveAccess(userId);
  if (!activeCheck.allowed) {
    return NextResponse.json({
      error: "trial_expired",
      message: "Ton essai gratuit est terminé. Choisis un forfait pour continuer."
    }, { status: 403 });
  }

  // Check monthly plan limit
  const limitCheck = await checkPlanLimit(userId, 'aiGenerations');
  if (!limitCheck.allowed) {
    return NextResponse.json({
      error: "limit_reached",
      limit: "aiGenerations",
      upgradeUrl: "/pricing",
      message: `Limite mensuelle de générations IA atteinte (${limitCheck.current}/${limitCheck.limit}). Passe au plan supérieur pour continuer.`
    }, { status: 402 });
  }

  const access = await getAccess();
  if (!access.aiTone) {
    return Response.json(
      { error: 'Changer le ton nécessite le plan Pro ou supérieur.' },
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
    const { prompt, platforms, tone } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Use the unified generatePost function
    const result = await generatePost({
      content: prompt,
      action: "generate",
      platform: platforms && platforms.length > 0 ? platforms[0] : undefined,
      tone: tone || "professional",
    });

    // Log the AI usage
    await db.insert(aiLogs).values({
      userId,
      action: "generate",
      platform: platforms && platforms.length > 0 ? platforms[0] : null,
      tone: tone || "professional",
      provider: result.provider,
      tokensUsed: result.tokensUsed ?? null,
    });

    // Increment AI count in DB
    await db.update(users)
      .set({ monthlyAiCount: sql`${users.monthlyAiCount} + 1` })
      .where(eq(users.clerkId, userId));

    return NextResponse.json({ generated: result.result, provider: result.provider });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
