"use server";

import { db } from "@/lib/db";
import { users, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateOnboardingStep(step: string | number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      onboardingStep: step,
    },
  });
}

export async function saveClientType(clientType: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(users).set({ clientType }).where(eq(users.clerkId, userId));
  
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      clientType,
      onboardingStep: 2,
    },
  });
  
  revalidatePath("/dashboard");
}

export async function createWorkspace(data: { name: string; logoUrl?: string; clientType?: string }) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    // Get internal user ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) throw new Error("User not found");

    const [newWorkspace] = await db.insert(workspaces).values({
      name: data.name,
      logoUrl: data.logoUrl,
      ownerId: user.id,
      clientType: data.clientType,
    }).returning();

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        workspaceId: newWorkspace.id,
        onboardingStep: 4,
      },
    });

    revalidatePath("/dashboard");
    return newWorkspace;
  } catch (error) {
    console.error("createWorkspace DB error:", error);
    // do not throw — just return silently
  }
}

export async function saveWritingStyle(writingTone: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(users).set({ writingTone }).where(eq(users.clerkId, userId));
  
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      writingTone,
      onboardingStep: 5,
    },
  });

  revalidatePath("/dashboard");
}

export async function saveGenderAgreement(genderAgreement: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(users).set({ genderAgreement }).where(eq(users.clerkId, userId));
  
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      genderAgreement,
      onboardingStep: 6,
    },
  });

  revalidatePath("/dashboard");
}

export async function saveEmojiPreference(emojiPreference: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(users).set({ emojiPreference }).where(eq(users.clerkId, userId));
  
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      emojiPreference,
      onboardingStep: "final",
    },
  });

  revalidatePath("/dashboard");
}

export async function completeOnboarding() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(users).set({ 
    onboardingCompleted: true,
    onboardingCompletedAt: new Date(),
  }).where(eq(users.clerkId, userId));
  
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      onboardingStep: "done",
    },
  });

  revalidatePath("/dashboard");
}
