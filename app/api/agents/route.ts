import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiAgents } from "@/lib/db/schema";
import { getAgentContext, listAgents, MAX_AGENTS, normalizeConfig } from "@/lib/agents/server";

export const dynamic = "force-dynamic";

// Agents de l'espace actif (3 maximum, plan Business).
export async function GET() {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;
  const agents = await listAgents(ctx);
  return NextResponse.json({ agents, max: MAX_AGENTS });
}

export async function POST(req: Request) {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;

  const existing = await listAgents(ctx);
  if (existing.length >= MAX_AGENTS) {
    return NextResponse.json(
      { error: "limit_reached", message: `Vous avez déjà ${MAX_AGENTS} agents. Supprimez-en un pour en créer un nouveau.` },
      { status: 402 }
    );
  }

  const config = normalizeConfig(await req.json().catch(() => ({})));
  if (typeof config === "string") return NextResponse.json({ error: "invalid", message: config }, { status: 400 });

  const [agent] = await db
    .insert(aiAgents)
    .values({ ...config, userId: ctx.user.id, organizationId: ctx.orgId })
    .returning();
  return NextResponse.json({ agent }, { status: 201 });
}
