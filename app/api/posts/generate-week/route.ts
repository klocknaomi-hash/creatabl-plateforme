import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, socialAccounts, users, userSettings } from "@/lib/db/schema";
import { generatePost, type PostTone } from "@/lib/ai-provider";
import { getAccess } from "@/lib/get-access";
import { checkPlanLimit } from "@/lib/plans/check-limit";
import { checkActiveAccess } from "@/lib/plans/check-active";
import { recordAiGeneration } from "@/lib/plans/credits";

export const dynamic = "force-dynamic";

const TONES: Record<string, PostTone> = {
  professional: "professional",
  inspiring: "storytelling",
  direct: "viral",
  casual: "conversational",
};

// Lundi prochain (ou dans 7 jours si on est lundi), à 9 h 30, heure de Paris approchée en UTC.
function nextWeekDays(now = new Date()) {
  const day = now.getUTCDay(); // 0 = dimanche
  const toMonday = ((8 - day) % 7) || 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + toMonday, 7, 30));
  return Array.from({ length: 5 }, (_, i) => new Date(monday.getTime() + i * 24 * 60 * 60 * 1000));
}

function parseIdeas(raw: string): string[] {
  const text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start >= 0 && end > start) {
      const arr = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(arr)) {
        return arr
          .map((x) => (typeof x === "string" ? x : x?.content ?? x?.texte ?? x?.post ?? ""))
          .map((s: string) => String(s).trim())
          .filter(Boolean);
      }
    }
  } catch {
    // repli ci-dessous
  }
  return text
    .split(/\n-{3,}\n|\n(?=(?:Post|Jour)\s*\d)/i)
    .map((s) => s.replace(/^(?:Post|Jour)\s*\d+\s*[:.-]\s*/i, "").trim())
    .filter((s) => s.length > 20);
}

// « Générer une semaine » : l'IA propose 5 posts, enregistrés en brouillons datés du
// lundi au vendredi suivants. Visibles dans le calendrier et les publications ; ils ne
// consomment pas de crédit tant qu'ils ne sont pas programmés.
export async function POST(req: Request) {
  const { userId: clerkId, orgId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const active = await checkActiveAccess(clerkId);
  if (!active.allowed) {
    return NextResponse.json({ error: "trial_expired", message: "Votre essai gratuit est terminé. Choisissez un forfait pour continuer." }, { status: 403 });
  }
  const access = await getAccess();
  if (!access.aiBasic) {
    return NextResponse.json({ error: "plan", message: "Générer avec l'IA nécessite le plan Starter ou supérieur." }, { status: 403 });
  }
  const limit = await checkPlanLimit(clerkId, "aiGenerations", orgId);
  if (!limit.allowed) {
    return NextResponse.json({ error: "limit_reached", message: "Limite de générations IA atteinte pour cette période." }, { status: 402 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const theme: string = typeof body?.theme === "string" ? body.theme.slice(0, 300) : "";

  const [accounts, settings] = await Promise.all([
    db.select({ platform: socialAccounts.platform }).from(socialAccounts).where(
      orgId ? eq(socialAccounts.organizationId, orgId) : eq(socialAccounts.userId, user.id)
    ),
    db.query.userSettings.findFirst({ where: eq(userSettings.userId, user.id) }),
  ]);
  const platforms = Array.from(new Set(accounts.map((a) => a.platform)));
  const brand = (settings?.workspaceBranding as { brand?: { brandName?: string; description?: string } } | null)?.brand;

  const prompt = [
    "Propose 5 posts pour les réseaux sociaux, un par jour du lundi au vendredi.",
    brand?.brandName ? `Marque : ${brand.brandName}.` : "",
    brand?.description ? `Activité : ${brand.description}.` : "",
    theme ? `Thème de la semaine : ${theme}.` : "Varie les sujets : conseil, coulisses, question à la communauté, preuve sociale, actualité.",
    platforms.length ? `Réseaux : ${platforms.join(", ")}.` : "",
    "Chaque post fait 2 à 5 phrases en français, avec 2 ou 3 hashtags pertinents.",
    'Réponds uniquement avec un tableau JSON de 5 chaînes : ["post du lundi", "post du mardi", ...].',
  ].filter(Boolean).join("\n");

  let ideas: string[] = [];
  try {
    const result = await generatePost({
      content: prompt,
      action: "generate",
      tone: TONES[user.writingTone ?? ""] ?? "professional",
      platform: (platforms[0] as never) ?? undefined,
    });
    ideas = parseIdeas(result.result).slice(0, 5);
    await recordAiGeneration(clerkId, { action: "generate_week", provider: result.provider, tokensUsed: result.tokensUsed ?? null });
  } catch (error) {
    console.error("[generate-week] AI error:", error);
    return NextResponse.json({ error: "ai_error", message: "L'IA n'a pas pu générer la semaine. Réessayez dans un instant." }, { status: 502 });
  }

  if (ideas.length === 0) {
    return NextResponse.json({ error: "ai_empty", message: "L'IA n'a rien proposé. Réessayez avec un thème." }, { status: 502 });
  }

  const days = nextWeekDays();
  const created = await db
    .insert(posts)
    .values(
      ideas.map((content, i) => ({
        userId: user.id,
        organizationId: orgId ?? null,
        content,
        platforms,
        mediaUrls: [],
        status: "draft" as const,
        scheduledAt: days[i],
      }))
    )
    .returning({ id: posts.id });

  return NextResponse.json({ created: created.length, ids: created.map((c) => c.id), weekOf: days[0].toISOString() });
}
