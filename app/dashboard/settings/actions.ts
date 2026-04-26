"use server";

import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveSettingsAction(formData: any) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Prepare update data with type safety and fallbacks
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (formData.emailNotifications !== undefined) updateData.emailNotifications = !!formData.emailNotifications;
    if (formData.notificationFrequency !== undefined) updateData.notificationFrequency = formData.notificationFrequency;
    if (formData.notifyNewComments !== undefined) updateData.notifyNewComments = !!formData.notifyNewComments;
    if (formData.notifyNewFollowers !== undefined) updateData.notifyNewFollowers = !!formData.notifyNewFollowers;
    if (formData.notifyPostPerformance !== undefined) updateData.notifyPostPerformance = !!formData.notifyPostPerformance;
    if (formData.notifyScheduledPosts !== undefined) updateData.notifyScheduledPosts = !!formData.notifyScheduledPosts;
    if (formData.timezone !== undefined) updateData.timezone = formData.timezone;
    if (formData.autoSaveFrequency !== undefined) updateData.autoSaveFrequency = parseInt(formData.autoSaveFrequency) || 30;
    if (formData.enableAutoReplies !== undefined) updateData.enableAutoReplies = !!formData.enableAutoReplies;
    if (formData.analyticsReportFrequency !== undefined) updateData.analyticsReportFrequency = formData.analyticsReportFrequency;
    if (formData.workspaceName !== undefined) updateData.workspaceName = formData.workspaceName;
    if (formData.language !== undefined) updateData.language = formData.language;
    if (formData.locale !== undefined) updateData.locale = formData.locale;

    await db.update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, user.id));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to save settings:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

