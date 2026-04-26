import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings | Creatabl.ia",
  description: "Manage your account preferences and application settings.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id),
  });

  if (!settings) {
    // This should theoretically be handled by getCurrentUser now, but as a fallback:
    const [newSettings] = await db.insert(userSettings).values({
      userId: user.id,
    }).returning();
    
    return (
      <main className="min-h-screen bg-background/50">
        <SettingsForm initialSettings={newSettings} user={user} />
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-background/50">
      <SettingsForm initialSettings={settings} user={user} />
    </main>
  );
}

