import { neon } from "@neondatabase/serverless";

// Crée les tables des agents si elles n'existent pas encore, pour que la mise en
// production ne dépende pas d'un « drizzle-kit push » manuel. Mêmes colonnes que
// aiAgents / aiAgentRuns dans lib/db/schema.ts. Exécuté une fois par instance.
let ready: Promise<void> | null = null;

export function ensureAgentTables() {
  if (!ready) {
    ready = (async () => {
      const url = (process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "")
        .replace("&channel_binding=require", "")
        .replace("?channel_binding=require&", "?");
      const sql = neon(url);
      await sql`CREATE TABLE IF NOT EXISTS ai_agents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        organization_id text,
        name text NOT NULL,
        goal text NOT NULL,
        template text,
        sources jsonb NOT NULL DEFAULT '[]'::jsonb,
        keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
        urls jsonb NOT NULL DEFAULT '[]'::jsonb,
        platforms jsonb NOT NULL DEFAULT '[]'::jsonb,
        output text NOT NULL DEFAULT 'drafts',
        post_count integer NOT NULL DEFAULT 3,
        schedule text NOT NULL DEFAULT 'manual',
        status text NOT NULL DEFAULT 'active',
        last_run_at timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS ai_agent_runs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id),
        organization_id text,
        status text NOT NULL DEFAULT 'running',
        trigger text NOT NULL DEFAULT 'manual',
        steps jsonb NOT NULL DEFAULT '[]'::jsonb,
        sources_used jsonb NOT NULL DEFAULT '[]'::jsonb,
        result jsonb,
        error text,
        started_at timestamp NOT NULL DEFAULT now(),
        finished_at timestamp
      )`;
      await sql`ALTER TABLE ai_agent_runs ADD COLUMN IF NOT EXISTS bb_search_calls integer NOT NULL DEFAULT 0`;
      await sql`ALTER TABLE ai_agent_runs ADD COLUMN IF NOT EXISTS bb_fetch_calls integer NOT NULL DEFAULT 0`;
      await sql`ALTER TABLE ai_agent_runs ADD COLUMN IF NOT EXISTS bb_browser_seconds integer NOT NULL DEFAULT 0`;
      await sql`ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS notify_email boolean NOT NULL DEFAULT true`;
      await sql`CREATE INDEX IF NOT EXISTS ai_agents_user_idx ON ai_agents(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS ai_agent_runs_agent_idx ON ai_agent_runs(agent_id, started_at DESC)`;
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}
