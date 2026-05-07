import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { desc, isNotNull } from "drizzle-orm";

async function checkTokens() {
  try {
    const latestUsers = await db.select({
      clerkId: users.clerkId,
      canvaAccessToken: users.canvaAccessToken,
      canvaTokenExpiresAt: users.canvaTokenExpiresAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .orderBy(desc(users.updatedAt))
    .limit(5);

    console.log("Latest users with Canva status:");
    console.table(latestUsers.map(u => ({
      ...u,
      hasToken: !!u.canvaAccessToken,
      tokenPreview: u.canvaAccessToken ? `${u.canvaAccessToken.substring(0, 10)}...` : null
    })));

  } catch (error) {
    console.error("❌ Error checking tokens:", error);
  }
}

checkTokens();
