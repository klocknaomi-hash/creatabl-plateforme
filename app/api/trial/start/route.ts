import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan") || "starter";

  // Check if trial already started
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  if (user.trialStartedAt) {
    return NextResponse.json({ message: "Trial already started" });
  }

  const now = new Date();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(now.getDate() + 14);

  await db
    .update(users)
    .set({
      trialStartedAt: now,
      trialEndsAt: trialEndsAt,
      selectedPlan: plan,
    })
    .where(eq(users.clerkId, userId));

  return NextResponse.json({ message: "Trial started successfully" });
}
