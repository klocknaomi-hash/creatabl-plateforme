import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, posts, postPlatformResults, autoReplyRules, autoReplyLogs, socialAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Fetch all user data
    const [
      userPosts,
      userAccounts,
      userRules,
      userLogs
    ] = await Promise.all([
      db.query.posts.findMany({
        where: eq(posts.userId, user.id),
        with: {
          platformResults: true,
        },
      }),
      db.query.socialAccounts.findMany({
        where: eq(socialAccounts.userId, user.id),
      }),
      db.query.autoReplyRules.findMany({
        where: eq(autoReplyRules.userId, user.id),
      }),
      db.query.autoReplyLogs.findMany({
        where: eq(autoReplyLogs.userId, user.id),
      }),
    ]);

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.createdAt,
      },
      posts: userPosts,
      accounts: userAccounts.map(a => ({
        platform: a.platform,
        username: a.username,
      })),
      autoReply: {
        rules: userRules,
        logs: userLogs,
      },
      exportedAt: new Date().toISOString(),
    };

    const fileName = `creatabl-data-export-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
