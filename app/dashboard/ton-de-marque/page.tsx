import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/ds";
import { BrandForm } from "./brand-form";
import type { BrandInfo } from "./actions";

export const metadata = { title: "Ton de marque · Creatabl.ia" };

export default async function TonDeMarquePage() {
  const user = await getCurrentUser();
  let brand: BrandInfo = { brandName: "", email: user?.email ?? "", website: "", description: "" };
  if (user) {
    try {
      const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, user.id) });
      const saved = (settings?.workspaceBranding as { brand?: Partial<BrandInfo> } | null)?.brand;
      if (saved) brand = { ...brand, ...saved };
    } catch (error) {
      console.error("[ton-de-marque] load failed:", error);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[880px] content-start gap-6 pb-12">
      <PageHeader
        title="Ton de marque"
        description="Ces informations guident l'Agent IA pour écrire comme vous, sur tous vos réseaux."
      />
      <BrandForm
        initialBrand={brand}
        initialStyle={{
          writingTone: user?.writingTone ?? "",
          genderAgreement: user?.genderAgreement ?? "",
          emojiPreference: user?.emojiPreference ?? "",
        }}
      />
    </div>
  );
}
