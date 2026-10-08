"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";
import { saveEmojiPreference, saveGenderAgreement, saveWritingStyle } from "@/app/actions/onboarding";

export type BrandInfo = { brandName: string; email: string; website: string; description: string };

// Informations de marque (user_settings.workspace_branding.brand) et style d'écriture
// (users.writing_tone, gender_agreement, emoji_preference, déjà utilisés par l'IA).
export async function saveBrandAction(input: {
  brand: BrandInfo;
  writingTone: string;
  genderAgreement: string;
  emojiPreference: string;
}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Session expirée, reconnectez-vous." };

  const website = input.brand.website.trim();
  if (website && !/^https?:\/\/\S+\.\S+/.test(website)) {
    return { success: false, error: "Ajoutez https:// au début du lien du site.", field: "website" as const };
  }
  const email = input.brand.email.trim();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { success: false, error: "Cette adresse e-mail n'est pas valide.", field: "email" as const };
  }

  try {
    const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
    if (!user) return { success: false, error: "Compte introuvable." };

    await db.insert(userSettings).values({ userId: user.id }).onConflictDoNothing();
    const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, user.id) });
    const branding = (settings?.workspaceBranding as Record<string, unknown>) ?? {};
    await db
      .update(userSettings)
      .set({
        workspaceBranding: { ...branding, brand: { ...input.brand, website, email } },
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, user.id));

    if (input.writingTone) await saveWritingStyle(input.writingTone);
    if (input.genderAgreement) await saveGenderAgreement(input.genderAgreement);
    if (input.emojiPreference) await saveEmojiPreference(input.emojiPreference);

    revalidatePath("/dashboard/ton-de-marque");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[ton-de-marque] save failed:", error);
    return { success: false, error: "Impossible d'enregistrer. Réessayez dans un instant." };
  }
}
