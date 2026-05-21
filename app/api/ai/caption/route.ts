import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePost } from '@/lib/ai-provider';
import { db } from '@/lib/db';
import { aiLogs, users } from '@/lib/db/schema';
import { getAccess } from '@/lib/get-access';
import { checkAiRateLimit } from '@/lib/ai-rate-limit';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({ generated: result.result, provider: result.provider });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
