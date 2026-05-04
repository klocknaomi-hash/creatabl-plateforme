import { NextRequest, NextResponse } from "next/server";
import { generatePost, GeneratePostOptions } from "@/lib/ai-provider";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { aiLogs, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const PLAN_AI_LIMITS: Record<string, number> = {
  starter: 30,
  pro: 120,
  business: 500
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user info
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = (user.selectedPlan || "starter") as keyof typeof PLAN_AI_LIMITS;
    const limit = PLAN_AI_LIMITS[plan] || PLAN_AI_LIMITS.starter;
    const currentCount = user.monthlyAiCount || 0;

    // Check limit
    if (currentCount >= limit) {
      return NextResponse.json({
        limitReached: true,
        used: currentCount,
        limit: limit,
        plan: plan
      }, { status: 200 }); // Status 200 as requested
    }

    const body: GeneratePostOptions = await req.json();

    if (!body.content || !body.action) {
      return NextResponse.json(
        { error: "content and action are required" },
        { status: 400 }
      );
    }

    // Generate normally
    const result = await generatePost(body);

    // Increment counter and log action
    await db.transaction(async (tx) => {
      await tx.insert(aiLogs).values({
        userId: clerkId,
        action: body.action,
        platform: body.platform ?? null,
        tone: body.tone ?? null,
        provider: result.provider,
        tokensUsed: result.tokensUsed ?? null,
      });

      await tx.update(users)
        .set({ monthlyAiCount: sql`${users.monthlyAiCount} + 1` })
        .where(eq(users.clerkId, clerkId));
    });

    return NextResponse.json({ 
      result: result.result, 
      provider: result.provider,
      used: currentCount + 1,
      limit: limit,
      plan: plan
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-post] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
