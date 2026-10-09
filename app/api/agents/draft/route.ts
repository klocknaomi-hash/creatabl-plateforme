import { NextResponse } from "next/server";
import { draftConfigFromDescription, getAgentContext } from "@/lib/agents/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Transforme « Décrivez l'agent que vous voulez créer » en réglages à vérifier.
export async function POST(req: Request) {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json().catch(() => ({}));
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 1500) : "";
  if (description.length < 8) {
    return NextResponse.json({ error: "invalid", message: "Décrivez en une phrase ce que l'agent doit faire." }, { status: 400 });
  }
  const config = await draftConfigFromDescription(ctx, description);
  return NextResponse.json({ config });
}
