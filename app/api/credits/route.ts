import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkPlanLimit } from "@/lib/plans/check-limit";
import { currentCreditPeriod } from "@/lib/plans/credits";

export const dynamic = "force-dynamic";

// Crédits du mois : 1 crédit = 1 post programmé ou publié. Renouvelés le 1er du mois.
export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [posts, ai] = await Promise.all([
      checkPlanLimit(userId, "postsPerMonth", orgId),
      checkPlanLimit(userId, "aiGenerations", orgId),
    ]);
    const { resetAt } = currentCreditPeriod();
    const unlimited = posts.limit === -1;

    return NextResponse.json({
      plan: "plan" in posts ? posts.plan : "free",
      used: posts.current,
      limit: unlimited ? null : posts.limit,
      remaining: unlimited ? null : posts.remaining,
      resetAt: resetAt.toISOString(),
      ai: { used: ai.current, limit: ai.limit === -1 ? null : ai.limit },
    });
  } catch (error) {
    console.error("[credits] Failed to compute credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
