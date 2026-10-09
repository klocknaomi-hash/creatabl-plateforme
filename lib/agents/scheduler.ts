import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiAgents, users } from "@/lib/db/schema";
import { getAccessForClerkId } from "@/lib/get-access";
import { checkActiveAccess } from "@/lib/plans/check-active";
import { ensureAgentTables } from "./ensure-tables";
import { runAgent } from "./server";
import { sendAgentRunEmail } from "./email";

const HOUR = 60 * 60 * 1000;

// Le lundi selon l'heure de Paris (le planificateur tourne à 7 h, heure de Paris).
export function isMondayInParis(now = new Date()) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Paris" }).format(now) === "Mon";
}

// Agents à lancer maintenant : actifs, programmés, et pas déjà lancés récemment
// (évite un double lancement si le planificateur est rejoué).
export async function dueAgentIds(now = new Date()) {
  await ensureAgentTables();
  const schedules = isMondayInParis(now) ? ["daily", "weekly"] : ["daily"];
  const agents = await db
    .select({ id: aiAgents.id, schedule: aiAgents.schedule, lastRunAt: aiAgents.lastRunAt })
    .from(aiAgents)
    .where(and(eq(aiAgents.status, "active"), inArray(aiAgents.schedule, schedules)));
  return agents
    .filter((a) => {
      if (!a.lastRunAt) return true;
      const since = now.getTime() - a.lastRunAt.getTime();
      return a.schedule === "weekly" ? since > 6 * 24 * HOUR : since > 20 * HOUR;
    })
    .map((a) => a.id);
}

// Lance un agent programmé pour le compte de son propriétaire, puis envoie le résumé.
export async function runScheduledAgent(agentId: string) {
  await ensureAgentTables();
  const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, agentId));
  if (!agent || agent.status !== "active" || agent.schedule === "manual") return { skipped: "inactive" };

  const user = await db.query.users.findFirst({ where: eq(users.id, agent.userId) });
  if (!user) return { skipped: "user_not_found" };

  const active = await checkActiveAccess(user.clerkId);
  const access = await getAccessForClerkId(user.clerkId);
  if (!active.allowed || !access.team) return { skipped: "plan" };

  const run = await runAgent({ clerkId: user.clerkId, orgId: agent.organizationId, user }, agent, "schedule");
  if (agent.notifyEmail && user.email) {
    try {
      await sendAgentRunEmail(user.email, agent.name, run);
    } catch (err) {
      console.error("[agents] e-mail de résumé non envoyé :", err);
    }
  }
  return { runId: run.id, status: run.status };
}
