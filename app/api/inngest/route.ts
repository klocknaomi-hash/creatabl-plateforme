import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Une exécution d'agent (recherche, lecture, rédaction) peut durer jusqu'à une minute.
export const maxDuration = 120;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
  // Force HTTP on localhost during dev to prevent protocol mismatch errors
  ...(process.env.INNGEST_DEV === "1" && {
    baseUrl: "http://localhost:3000/api/inngest"
  })
});
