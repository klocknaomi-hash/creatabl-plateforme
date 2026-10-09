import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiAgents } from "@/lib/db/schema";
import { findAgent, getAgentContext, normalizeConfig } from "@/lib/agents/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// Modifie un agent : réglages complets, ou seulement son état (actif / en pause).
export async function PATCH(req: Request, { params }: Params) {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;
  const agent = await findAgent(ctx, (await params).id);
  if (!agent) return NextResponse.json({ error: "not_found", message: "Agent introuvable." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (Object.keys(body).length === 1 && (body.status === "active" || body.status === "paused")) {
    const [updated] = await db.update(aiAgents).set({ status: body.status, updatedAt: new Date() }).where(eq(aiAgents.id, agent.id)).returning();
    return NextResponse.json({ agent: updated });
  }

  const config = normalizeConfig({ ...agent, ...body });
  if (typeof config === "string") return NextResponse.json({ error: "invalid", message: config }, { status: 400 });
  const [updated] = await db.update(aiAgents).set({ ...config, updatedAt: new Date() }).where(eq(aiAgents.id, agent.id)).returning();
  return NextResponse.json({ agent: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;
  const agent = await findAgent(ctx, (await params).id);
  if (!agent) return NextResponse.json({ error: "not_found", message: "Agent introuvable." }, { status: 404 });
  await db.delete(aiAgents).where(eq(aiAgents.id, agent.id));
  return NextResponse.json({ ok: true });
}
