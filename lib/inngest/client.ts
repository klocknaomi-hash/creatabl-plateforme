import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "creatabl-ia", 
  name: "Creatabl.ia",
  // If we are in dev mode, explicitly point to the local dev server
  ...(process.env.INNGEST_DEV === "1" && {
    baseUrl: "http://localhost:8288"
  })
});
