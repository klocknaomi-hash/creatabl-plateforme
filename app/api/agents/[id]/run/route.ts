import { NextResponse } from "next/server";
import { findAgent, getAgentContext, runAgent } from "@/lib/agents/server";

export const dynamic = "force-dynamic";
// Recherche + lecture + rédaction : laisser le temps à l'exécution de se terminer.
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;
  const agent = await findAgent(ctx, (await params).id);
  if (!agent) return NextResponse.json({ error: "not_found", message: "Agent introuvable." }, { status: 404 });
  if (agent.status === "paused") {
    return NextResponse.json({ error: "paused", message: "Cet agent est en pause. Réactivez-le pour le lancer." }, { status: 409 });
  }
  const run = await runAgent(ctx, agent, "manual");
  return NextResponse.json({ run });
}
