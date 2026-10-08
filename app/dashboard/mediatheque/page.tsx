import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ds";
import { MediaLibrary } from "./media-library";

export const metadata = { title: "Médiathèque · Creatabl.ia" };

// Médiathèque : les médias importés dans Creatabl (fichiers et designs Canva),
// tels qu'enregistrés par /api/media/upload.
export default async function MediathequePage() {
  const user = await getCurrentUser();
  let items: { id: string; url: string; name: string; size: string | null; mimeType: string | null; createdAt: string }[] = [];
  let failed = false;
  if (user) {
    try {
      const rows = await db
        .select()
        .from(mediaAssets)
        .where(eq(mediaAssets.userId, user.id))
        .orderBy(desc(mediaAssets.createdAt))
        .limit(200);
      items = rows.map((r) => ({
        id: r.id,
        url: r.url,
        name: r.name,
        size: r.size,
        mimeType: r.mimeType,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("[mediatheque] load failed:", error);
      failed = true;
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1180px] content-start gap-6 pb-12">
      <PageHeader
        title="Médiathèque"
        description="Vos images et vidéos importées, prêtes à être ajoutées à vos posts."
      />
      <MediaLibrary initialItems={items} failed={failed} />
    </div>
  );
}
