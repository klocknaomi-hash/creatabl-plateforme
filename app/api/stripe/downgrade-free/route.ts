import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL("/sign-in", req.nextUrl.origin)
    );
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: "free",
        selectedPlan: "free",
      },
    });

    await db
      .update(users)
      .set({
        plan: "free",
        selectedPlan: "free",
      })
      .where(eq(users.clerkId, userId));
  } catch (err) {
    console.error("Error updating user plan to free:", err);
  }

  return NextResponse.redirect(new URL("/dashboard/billing", req.nextUrl.origin));
}
