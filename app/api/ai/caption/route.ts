import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePost } from '@/lib/ai-provider';
import { db } from '@/lib/db';
import { aiLogs } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
