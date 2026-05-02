import { inngest } from "../client";


export const commentMonitor = inngest.createFunction(
  { 
    id: "comment-monitor",
    name: "Comment Monitor",
    triggers: [
      { cron: "*/15 * * * *" },
      { event: "comment/monitor.trigger" }
    ]
  },
  async ({ step }) => {
    // Auto-Reply feature is currently disabled for MVP
    return;
  }
);
