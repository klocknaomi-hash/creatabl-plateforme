import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
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

    const plan = (user.selectedPlan || "starter") as keyof typeof PLAN_AI_LIMITS;
    const limit = PLAN_AI_LIMITS[plan] || PLAN_AI_LIMITS.starter;
    const used = user.monthlyAiCount || 0;

    return NextResponse.json({ 
      used, 
      limit, 
      plan 
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
