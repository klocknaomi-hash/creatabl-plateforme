import { inngest } from "./client";
import { dueAgentIds, runScheduledAgent } from "@/lib/agents/scheduler";

// Chaque jour à 7 h (heure de Paris) : agents « chaque jour », et le lundi les agents
// « chaque lundi ». Un événement par agent, exécuté séparément (3 à la fois).
export const agentsScheduler = inngest.createFunction(
  { id: "agents-scheduler", name: "Agents IA : lancements programmés", triggers: [{ cron: "TZ=Europe/Paris 0 7 * * *" }] },
  async ({ step }: { step: any }) => {
    const ids: string[] = await step.run("find-due-agents", () => dueAgentIds());
    if (ids.length) {
      await step.sendEvent(
        "fan-out",
        ids.map((agentId) => ({ name: "agent/run.scheduled", data: { agentId } }))
      );
    }
    return { scheduled: ids.length };
  }
);

export const runScheduledAgentFn = inngest.createFunction(
  {
    id: "agent-run-scheduled",
    name: "Agents IA : exécution programmée",
    concurrency: { limit: 3 },
    retries: 1,
    triggers: [{ event: "agent/run.scheduled" as any }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    return step.run("run-agent", () => runScheduledAgent(event.data.agentId));
  }
);
