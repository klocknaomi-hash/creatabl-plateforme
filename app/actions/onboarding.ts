"use server";

import { db } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Helper to ensure user exists in Neon DB
 * Find or create the user record in the users table
 */
async function getOrCreateUser(clerkId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (user) return user;

    // Fetch from Clerk if missing in DB
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    const [newUser] = await db.insert(users).values({
      clerkId,
      email,
      name: name || null,
      plan: 'starter',
    }).onConflictDoNothing().returning();

    if (newUser) return newUser;
    
    // Fallback if insert returned nothing due to conflict
    return await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  } catch (error) {
    console.error("getOrCreateUser error:", error);
    return null;
  }
}

export async function updateOnboardingStep(step: string | number) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingStep: step,
      },
    });
  } catch (error) {
    console.error("updateOnboardingStep error:", error);
  }
}

export async function saveClientType(clientType: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const user = await getOrCreateUser(userId);
    if (!user) return;

    await db.update(users).set({ clientType }).where(eq(users.id, user.id));
    console.log('Saved clientType for user', userId, ':', clientType);
    
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        clientType,
        onboardingStep: 2,
      },
    });
    
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("saveClientType error:", error);
  }
}

export async function createWorkspace(data: { name: string; logoUrl?: string; clientType?: string }) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const user = await getOrCreateUser(userId);
    if (!user) return;

    const [newWorkspace] = await db.insert(workspaces).values({
      name: data.name,
      logoUrl: data.logoUrl,
      ownerId: user.id,
      clientType: data.clientType,
    }).onConflictDoNothing().returning();

    console.log('Saved workspace for user', userId, ':', data.name);

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        workspaceId: newWorkspace?.id,
        onboardingStep: 4,
      },
    });

    revalidatePath("/dashboard");
    return newWorkspace;
  } catch (error) {
    console.error("createWorkspace error:", error);
  }
}

export async function saveWritingStyle(writingTone: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const user = await getOrCreateUser(userId);
    if (!user) return;

    await db.update(users).set({ writingTone }).where(eq(users.id, user.id));
    console.log('Saved writingTone for user', userId, ':', writingTone);
    
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        writingTone,
        onboardingStep: 5,
      },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("saveWritingStyle error:", error);
  }
}

export async function saveGenderAgreement(genderAgreement: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const user = await getOrCreateUser(userId);
    if (!user) return;

    await db.update(users).set({ genderAgreement }).where(eq(users.id, user.id));
    console.log('Saved genderAgreement for user', userId, ':', genderAgreement);
    
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        genderAgreement,
        onboardingStep: 6,
      },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("saveGenderAgreement error:", error);
  }
}

export async function saveEmojiPreference(emojiPreference: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const user = await getOrCreateUser(userId);
    if (!user) return;

    await db.update(users).set({ emojiPreference }).where(eq(users.id, user.id));
    console.log('Saved emojiPreference for user', userId, ':', emojiPreference);
    
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        emojiPreference,
        onboardingStep: "final",
      },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("saveEmojiPreference error:", error);
  }
}

export async function completeOnboarding() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "No userId" };

    const client = await clerkClient();
    const now = new Date();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update Clerk metadata FIRST — this is critical to stop the modal from showing
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { 
        onboardingStep: "done",
        trialStartedAt: now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        trialPlan: "business"
      }
    });
    
    // Update DB — wrapped separately
    try {
      await db.update(users).set({ 
        plan: "business",
        trialStartedAt: now,
        trialEndsAt: trialEndsAt,
        onboardingCompletedAt: now,
        onboardingCompleted: true,
      }).where(eq(users.clerkId, userId));
      console.log('Saved onboarding completion and trial in DB for user', userId);
    } catch (dbErr) {
      console.error("DB update failed but Clerk is updated:", dbErr);
    }
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("completeOnboarding error:", error);
    return { success: false, error: String(error) };
  }
}
