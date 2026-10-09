import { Resend } from "resend";

// Résumé envoyé après un lancement automatique d'agent. Sans clé Resend valide,
// le message est seulement journalisé (même comportement que les invitations).
const key = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM_EMAIL || "noreply@creatabl-ia.com";
const configured = Boolean(key && !key.startsWith("re_placeholder") && key !== "re_...");

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type RunSummary = {
  status: string;
  error: string | null;
  result: { ideas: { title: string; content: string; platform?: string }[]; draftIds: string[] } | null;
  sourcesUsed: { title: string }[];
};

const NETWORK: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", twitter: "X" };

export async function sendAgentRunEmail(to: string, agentName: string, run: RunSummary) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.creatabl-ia.com";
  const link = `${appUrl}/dashboard/agent-ia?onglet=executions`;
  const ok = run.status === "succeeded";
  const ideas = run.result?.ideas ?? [];
  const drafts = run.result?.draftIds.length ?? 0;

  const subject = ok
    ? drafts
      ? `Votre agent « ${agentName} » a préparé ${drafts} brouillon${drafts > 1 ? "s" : ""}`
      : `Votre agent « ${agentName} » a ${ideas.length} idée${ideas.length > 1 ? "s" : ""} pour vous`
    : `Votre agent « ${agentName} » n'a pas pu s'exécuter`;

  const items = ideas
    .map(
      (i) => `
      <tr><td style="padding:16px;border:1px solid #E8E6F0;border-radius:12px;">
        <div style="font-size:12px;color:#6B6780;margin-bottom:4px;">${esc(NETWORK[i.platform ?? ""] ?? "")}</div>
        <div style="font-size:15px;font-weight:600;color:#14121F;margin-bottom:6px;">${esc(i.title)}</div>
        <div style="font-size:14px;line-height:22px;color:#4B4B63;">${esc(i.content.slice(0, 280))}${i.content.length > 280 ? "…" : ""}</div>
      </td></tr><tr><td style="height:12px;"></td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(subject)}</title></head>
  <body style="margin:0;padding:0;background:#F8F7FC;font-family:Inter,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:32px auto;background:#FFFFFF;border:1px solid #E8E6F0;border-radius:12px;">
      <tr><td style="padding:24px 32px;border-bottom:1px solid #E8E6F0;font-size:18px;font-weight:700;color:#14121F;">Creatabl.<span style="color:#7225E3;font-style:italic;">ia</span></td></tr>
      <tr><td style="padding:28px 32px 8px;">
        <h1 style="margin:0 0 8px;font-size:20px;line-height:28px;color:#14121F;">${esc(subject)}</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:22px;color:#4B4B63;">${
          ok
            ? `L'agent a consulté ${run.sourcesUsed.length} source${run.sourcesUsed.length > 1 ? "s" : ""}.${drafts ? " Les brouillons vous attendent dans Publications : relisez-les avant de les programmer." : ""}`
            : esc(run.error || "Une erreur est survenue pendant l'exécution.")
        }</p>
        <table width="100%" cellpadding="0" cellspacing="0">${items}</table>
      </td></tr>
      <tr><td style="padding:8px 32px 32px;">
        <a href="${link}" style="display:inline-block;background:#7225E3;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">${ok ? "Voir le résultat" : "Voir le détail"}</a>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #E8E6F0;font-size:12px;color:#6B6780;">Vous recevez ce résumé car il est activé sur cet agent. Désactivez-le dans Agent IA → Mes agents → Modifier.</td></tr>
    </table>
  </body></html>`;

  if (!configured) {
    console.log(`[agents] e-mail non envoyé (Resend non configuré) → ${to} : ${subject}`);
    return { sent: false };
  }
  await new Resend(key).emails.send({ from: `Creatabl.ia <${from}>`, to, subject, html });
  return { sent: true };
}
