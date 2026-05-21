import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, aiUsage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PLAN_AI_LIMITS: Record<string, number> = {
  starter: 30,
  pro: 120,
  business: 300
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    
    if (!user) {
      return NextResponse.json({ used: 0, limit: 30, plan: "starter" });
    }

    let planName = (user.plan || user.selectedPlan || 'starter').toLowerCase();
    if (planName === 'free') planName = 'starter';
    if (planName === 'agency') planName = 'business';
    const plan = (['starter', 'pro', 'business'].includes(planName) ? planName : 'starter') as 'starter' | 'pro' | 'business';
    const limit = PLAN_AI_LIMITS[plan] || PLAN_AI_LIMITS.starter;

    const [usage] = await db.select().from(aiUsage).where(eq(aiUsage.userId, clerkId)).limit(1);
    
    let used = 0;
    if (usage) {
      const now = new Date();
      const windowExpiry = new Date(usage.windowStart.getTime() + 24 * 3600000);
      if (now > windowExpiry) {
        used = 0;
      } else {
        used = usage.requestCount;
      }
    }

    return NextResponse.json({ 
      used, 
      limit, 
      plan 
    });

  } catch (error) {
    console.error("Failed to fetch AI usage stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
