import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiAgentRuns, aiAgents } from "@/lib/db/schema";
import { getAgentContext, runScope } from "@/lib/agents/server";

export const dynamic = "force-dynamic";

// Dernières exécutions de l'espace, avec le nom de l'agent.
export async function GET() {
  const ctx = await getAgentContext();
  if (ctx instanceof NextResponse) return ctx;
  const runs = await db
    .select({ run: aiAgentRuns, agentName: aiAgents.name })
    .from(aiAgentRuns)
    .innerJoin(aiAgents, eq(aiAgentRuns.agentId, aiAgents.id))
    .where(runScope(ctx))
    .orderBy(desc(aiAgentRuns.startedAt))
    .limit(30);
  return NextResponse.json({ runs: runs.map((r) => ({ ...r.run, agentName: r.agentName })) });
}
