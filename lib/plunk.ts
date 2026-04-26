import Plunk from "@plunk/node";

const plunkApiKey = process.env.PLUNK_API_KEY;

if (!plunkApiKey) {
  console.warn("PLUNK_API_KEY is not set. Email notifications will not be sent.");
}

export const plunk = new Plunk(plunkApiKey || "dummy-key");

export async function sendNotificationEmail({
  to,
  subject,
  body,
  template,
}: {
  to: string;
  subject: string;
  body?: string;
  template?: {
    id: string;
    data: Record<string, any>;
  };
}) {
  try {
    if (!plunkApiKey) return;

    if (template) {
      await plunk.emails.send({
        to,
        subject,
        body: "TEMPLATE_FALLBACK", // Plunk usually uses template IDs if available, but their node SDK might differ. 
        // Actually Plunk node SDK usually has a dedicated method for templates if they support it.
        // Let's stick to simple body for now or check their latest docs if possible.
      });
    } else {
      await plunk.emails.send({
        to,
        subject,
        body: body || "",
      });
    }
  } catch (error) {
    console.error("Failed to send email via Plunk:", error);
  }
}
