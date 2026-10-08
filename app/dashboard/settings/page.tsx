import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userSettings, posts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { SettingsForm } from "./settings-form";
import { getAccess } from "@/lib/get-access";

export const metadata: Metadata = {
  title: "Paramètres · Creatabl.ia",
  description: "Préférences du compte et réglages de la plateforme.",
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


  const access = await getAccess();
  const automation = ((settings.workspaceBranding as { automation?: { autoPublish?: boolean; clientApproval?: boolean } } | null)?.automation) ?? {};

  const postsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.userId, user.id));

  return (
    <main className="min-h-screen bg-background/50">
      <SettingsForm 
        initialSettings={{ ...settings, autoPublish: !!automation.autoPublish, clientApproval: !!automation.clientApproval }} 
        user={user} 
        isBusiness={access.team}
        hasData={Number(postsCount[0]?.count || 0) > 0} 
      />
    </main>
  );
}

