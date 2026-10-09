import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiAgentRuns, aiAgents, posts, userSettings, users } from "@/lib/db/schema";
import { getAccess } from "@/lib/get-access";
import { checkActiveAccess } from "@/lib/plans/check-active";
import { recordAiGeneration } from "@/lib/plans/credits";
import { generateRaw } from "@/lib/ai-provider";
import { ensureAgentTables } from "./ensure-tables";
import { fetchGoogleNews, fetchGoogleTrends, fetchPage, fetchReddit, fetchYoutube, type SourceItem } from "./sources";
import {
  AGENT_TEMPLATES,
  MAX_AGENTS,
  PLATFORMS,
  SOURCES,
  type AgentConfig,
  type AgentOutput,
  type AgentSchedule,
  type AgentSource,
} from "./templates";

type UserRow = typeof users.$inferSelect;
export type AgentRow = typeof aiAgents.$inferSelect;

export type AgentContext = { clerkId: string; orgId: string | null; user: UserRow };

const fail = (status: number, error: string, message: string) => NextResponse.json({ error, message }, { status });

// Agents IA automatiques : plan Business (et essai, qui donne accès au Business).
export async function getAgentContext(): Promise<AgentContext | NextResponse> {
  const { userId: clerkId, orgId } = await auth();
  if (!clerkId) return fail(401, "unauthorized", "Connectez-vous pour continuer.");

  const active = await checkActiveAccess(clerkId);
  if (!active.allowed) return fail(403, "trial_expired", "Votre essai gratuit est terminé. Choisissez un forfait pour continuer.");

  const access = await getAccess();
  if (!access.team) return fail(403, "plan", "Les agents IA sont inclus dans le plan Business.");

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return fail(404, "user_not_found", "Compte introuvable.");

  await ensureAgentTables();
  return { clerkId, orgId: orgId ?? null, user };
}

// Un espace = l'organisation active, sinon l'espace personnel de l'utilisateur.
export function agentScope(ctx: AgentContext) {
  return ctx.orgId
    ? eq(aiAgents.organizationId, ctx.orgId)
    : and(eq(aiAgents.userId, ctx.user.id), isNull(aiAgents.organizationId));
}

export function runScope(ctx: AgentContext) {
  return ctx.orgId
    ? eq(aiAgentRuns.organizationId, ctx.orgId)
    : and(eq(aiAgentRuns.userId, ctx.user.id), isNull(aiAgentRuns.organizationId));
}

export async function listAgents(ctx: AgentContext) {
  return db.select().from(aiAgents).where(agentScope(ctx)).orderBy(desc(aiAgents.createdAt));
}

export async function findAgent(ctx: AgentContext, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [agent] = await db.select().from(aiAgents).where(and(eq(aiAgents.id, id), agentScope(ctx)));
  return agent ?? null;
}

export { MAX_AGENTS };

// ─── Validation d'une configuration envoyée par l'interface ───
const clampList = (v: unknown, max: number, maxLen = 120) =>
  Array.isArray(v)
    ? Array.from(new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, maxLen)).filter(Boolean))).slice(0, max)
    : [];

export function normalizeConfig(input: Partial<Record<keyof AgentConfig, unknown>>): AgentConfig | string {
  const name = typeof input.name === "string" ? input.name.trim().slice(0, 80) : "";
  const goal = typeof input.goal === "string" ? input.goal.trim().slice(0, 1000) : "";
  if (!name) return "Donnez un nom à l'agent.";
  if (goal.length < 10) return "Décrivez l'objectif de l'agent en une phrase ou deux.";

  const sources = clampList(input.sources, SOURCES.length).filter((s): s is AgentSource => (SOURCES as string[]).includes(s));
  const urls = clampList(input.urls, 5, 500).filter((u) => /^https?:\/\//i.test(u));
  if (sources.length === 0) return "Choisissez au moins une source.";
  if (sources.includes("web") && urls.length === 0 && sources.length === 1) return "Ajoutez au moins une adresse de page web à lire.";

  const platforms = clampList(input.platforms, PLATFORMS.length).filter((p) => (PLATFORMS as readonly string[]).includes(p));
  const output: AgentOutput = input.output === "ideas" ? "ideas" : "drafts";
  const schedule: AgentSchedule = input.schedule === "daily" || input.schedule === "weekly" ? input.schedule : "manual";
  const postCount = Math.min(5, Math.max(1, Number(input.postCount) || 3));
  const template = typeof input.template === "string" && AGENT_TEMPLATES.some((t) => t.id === input.template) ? input.template : null;

  return {
    name,
    goal,
    template,
    sources,
    keywords: clampList(input.keywords, 8, 60),
    urls,
    platforms: platforms.length ? platforms : ["linkedin"],
    output,
    postCount,
    schedule,
  };
}

// ─── JSON renvoyé par l'IA ───
function extractJson(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  for (const [open, close] of [["{", "}"], ["[", "]"]] as const) {
    const start = text.indexOf(open);
    const end = text.lastIndexOf(close);
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        // essai suivant
      }
    }
  }
  return null;
}

async function brandContext(userId: string) {
  const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, userId) });
  const brand = (settings?.workspaceBranding as { brand?: { brandName?: string; description?: string; website?: string } } | null)?.brand;
  return brand ?? {};
}

// ─── « Décrivez l'agent que vous voulez créer » → configuration proposée ───
export async function draftConfigFromDescription(ctx: AgentContext, description: string): Promise<AgentConfig> {
  const brand = await brandContext(ctx.user.id);
  const urls = Array.from(new Set(description.match(/https?:\/\/[^\s)>"']+/g) ?? [])).slice(0, 5);
  const fallback = (): AgentConfig => {
    const lower = description.toLowerCase();
    const sources: AgentSource[] = [];
    if (urls.length) sources.push("web");
    if (/reddit/.test(lower)) sources.push("reddit");
    if (/youtube|vidéo/.test(lower)) sources.push("youtube");
    if (/tendance|trend/.test(lower)) sources.push("google_trends");
    if (sources.length === 0 || /actu|veille|news/.test(lower)) sources.push("google_news");
    return {
      name: description.replace(/https?:\/\/\S+/g, "").trim().split(/[.!?\n]/)[0].slice(0, 60) || "Mon agent",
      goal: description.slice(0, 1000),
      template: null,
      sources: Array.from(new Set(sources)),
      keywords: [],
      urls,
      platforms: ["linkedin"],
      output: "drafts",
      postCount: 3,
      schedule: /chaque jour|quotidien/.test(lower) ? "daily" : /chaque semaine|hebdo|lundi/.test(lower) ? "weekly" : "manual",
    };
  };

  const system = [
    "Tu configures un agent IA de Creatabl.ia, une plateforme de gestion des réseaux sociaux.",
    "À partir de la demande de l'utilisateur, réponds UNIQUEMENT avec un objet JSON :",
    '{"name": string (max 40 caractères, en français), "goal": string (1 à 2 phrases), "sources": array parmi ["google_news","google_trends","reddit","youtube","web"], "keywords": array de 0 à 5 mots-clés de recherche, "platforms": array parmi ["linkedin","instagram","facebook","twitter"], "output": "drafts" ou "ideas", "postCount": entier de 1 à 5, "schedule": "manual" | "daily" | "weekly"}',
    "Utilise \"web\" seulement si la demande contient une adresse de page. Par défaut : output \"drafts\", postCount 3, schedule \"manual\".",
    brand.brandName ? `Marque de l'utilisateur : ${brand.brandName}.` : "",
    brand.description ? `Activité : ${brand.description}.` : "",
  ].filter(Boolean).join("\n");

  try {
    const res = await generateRaw(description, system);
    const parsed = extractJson(res.result) as Record<string, unknown> | null;
    if (!parsed || Array.isArray(parsed)) return fallback();
    const merged = normalizeConfig({ ...parsed, urls: urls.length ? urls : parsed.urls });
    return typeof merged === "string" ? fallback() : merged;
  } catch (err) {
    console.error("[agents] draft config failed:", err);
    return fallback();
  }
}

// ─── Exécution d'un agent ───
type Step = { label: string; status: "done" | "failed" | "skipped"; detail?: string };
type Idea = { title: string; content: string; platform?: string; hashtags?: string[] };

function nextWeekDays(count: number, now = new Date()) {
  const day = now.getUTCDay();
  const toMonday = ((8 - day) % 7) || 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + toMonday, 7, 30));
  return Array.from({ length: count }, (_, i) => new Date(monday.getTime() + i * 24 * 60 * 60 * 1000));
}

export async function runAgent(ctx: AgentContext, agent: AgentRow, trigger: "manual" | "schedule" = "manual") {
  const [run] = await db
    .insert(aiAgentRuns)
    .values({ agentId: agent.id, userId: ctx.user.id, organizationId: ctx.orgId, status: "running", trigger })
    .returning();

  const steps: Step[] = [];
  const found: SourceItem[] = [];
  const brand = await brandContext(ctx.user.id);
  const query = agent.keywords.length ? agent.keywords.join(" ") : brand.description || agent.goal.slice(0, 120);

  try {
    // 1. Recherche dans les sources choisies, en parallèle.
    const tasks: [string, Promise<SourceItem[]>][] = [];
    for (const s of agent.sources) {
      if (s === "google_news") tasks.push(["Google Actualités", fetchGoogleNews(query, 6)]);
      if (s === "reddit") tasks.push(["Reddit", fetchReddit({ query: agent.keywords.length ? query : undefined, max: 6 })]);
      if (s === "youtube") tasks.push(["YouTube", fetchYoutube({ query: agent.keywords.length ? query : undefined, max: 4 })]);
      if (s === "google_trends")
        tasks.push(["Google Trends", fetchGoogleTrends().then((t) => t.map((x) => ({ title: x.title, url: x.url, source: "Google Trends" })))]);
    }
    const results = await Promise.all(tasks.map(([, p]) => p.catch(() => [] as SourceItem[])));
    tasks.forEach(([label], i) => {
      const n = results[i].length;
      steps.push({ label: `Recherche : ${label}`, status: n ? "done" : "failed", detail: n ? `${n} résultat${n > 1 ? "s" : ""}` : "aucun résultat" });
      found.push(...results[i]);
    });

    // 2. Lecture des pages web demandées.
    if (agent.sources.includes("web") && agent.urls.length) {
      const pages = await Promise.all(agent.urls.slice(0, 5).map((u) => fetchPage(u)));
      const ok = pages.filter((p): p is SourceItem => Boolean(p));
      steps.push({
        label: "Lecture des pages web",
        status: ok.length ? "done" : "failed",
        detail: `${ok.length} page${ok.length > 1 ? "s" : ""} lue${ok.length > 1 ? "s" : ""} sur ${agent.urls.length}`,
      });
      found.unshift(...ok);
    }

    if (found.length === 0) throw new Error("Aucune source n'a renvoyé de contenu. Essayez d'autres mots-clés ou une autre source.");

    // 3. Rédaction avec l'IA.
    const material = found
      .slice(0, 14)
      .map((s, i) => `[${i + 1}] ${s.title} (${s.source})${s.excerpt ? `\n${s.excerpt.slice(0, 1200)}` : ""}`)
      .join("\n\n");
    const tone = ctx.user.writingTone ? `Ton de marque : ${ctx.user.writingTone}.` : "";
    const system = [
      "Tu es un agent IA de Creatabl.ia qui prépare des posts pour les réseaux sociaux à partir de sources récentes.",
      `Objectif de l'agent : ${agent.goal}`,
      brand.brandName ? `Marque : ${brand.brandName}.` : "",
      brand.description ? `Activité : ${brand.description}.` : "",
      tone,
      `Réseaux visés : ${agent.platforms.join(", ")}.`,
      `Rédige exactement ${agent.postCount} post${agent.postCount > 1 ? "s" : ""} en français, chacun adapté à un des réseaux visés (alterne si plusieurs).`,
      "Appuie-toi sur les sources fournies, sans inventer de chiffres. Ne cite pas de concurrent par son nom.",
      'Réponds UNIQUEMENT avec un tableau JSON : [{"title": "idée en une ligne", "content": "texte complet du post", "platform": "linkedin|instagram|facebook|twitter", "hashtags": ["#..."]}]',
    ].filter(Boolean).join("\n");

    const ai = await generateRaw(`Sources :\n\n${material}`, system);
    await recordAiGeneration(ctx.clerkId, { action: "agent_run", provider: ai.provider, tokensUsed: ai.tokensUsed ?? null });
    const parsed = extractJson(ai.result);
    const ideas: Idea[] = (Array.isArray(parsed) ? parsed : [])
      .map((x: Record<string, unknown>) => ({
        title: String(x?.title ?? "").slice(0, 160),
        content: String(x?.content ?? "").trim(),
        platform: typeof x?.platform === "string" && (PLATFORMS as readonly string[]).includes(x.platform) ? x.platform : agent.platforms[0],
        hashtags: Array.isArray(x?.hashtags) ? (x.hashtags as unknown[]).map(String).slice(0, 6) : [],
      }))
      .filter((x) => x.content.length > 20)
      .slice(0, agent.postCount);
    if (ideas.length === 0) throw new Error("L'IA n'a pas renvoyé de post exploitable. Relancez l'agent.");
    steps.push({ label: "Rédaction des posts", status: "done", detail: `${ideas.length} post${ideas.length > 1 ? "s" : ""}` });

    // 4. Brouillons (visibles dans Publications et Calendrier).
    let draftIds: string[] = [];
    if (agent.output === "drafts") {
      const days = agent.template === "planifier-semaine" ? nextWeekDays(ideas.length) : null;
      const created = await db
        .insert(posts)
        .values(
          ideas.map((idea, i) => ({
            userId: ctx.user.id,
            organizationId: ctx.orgId,
            content: idea.hashtags?.length && !idea.content.includes(idea.hashtags[0]) ? `${idea.content}\n\n${idea.hashtags.join(" ")}` : idea.content,
            platforms: idea.platform ? [idea.platform] : agent.platforms.slice(0, 1),
            mediaUrls: [],
            status: "draft" as const,
            scheduledAt: days ? days[i] : null,
          }))
        )
        .returning({ id: posts.id });
      draftIds = created.map((c) => c.id);
      steps.push({ label: "Enregistrement des brouillons", status: "done", detail: `${draftIds.length} brouillon${draftIds.length > 1 ? "s" : ""}` });
    } else {
      steps.push({ label: "Enregistrement des brouillons", status: "skipped", detail: "idées seulement" });
    }

    const [done] = await db
      .update(aiAgentRuns)
      .set({
        status: "succeeded",
        steps,
        sourcesUsed: found.slice(0, 14).map((s) => ({ title: s.title, url: s.url, source: s.source })),
        result: { ideas, draftIds },
        finishedAt: new Date(),
      })
      .where(eq(aiAgentRuns.id, run.id))
      .returning();
    await db.update(aiAgents).set({ lastRunAt: new Date() }).where(eq(aiAgents.id, agent.id));
    return done;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    steps.push({ label: "Arrêt de l'exécution", status: "failed", detail: message });
    const [failed] = await db
      .update(aiAgentRuns)
      .set({
        status: "failed",
        steps,
        sourcesUsed: found.slice(0, 14).map((s) => ({ title: s.title, url: s.url, source: s.source })),
        error: message,
        finishedAt: new Date(),
      })
      .where(eq(aiAgentRuns.id, run.id))
      .returning();
    await db.update(aiAgents).set({ lastRunAt: new Date() }).where(eq(aiAgents.id, agent.id));
    return failed;
  }
}
