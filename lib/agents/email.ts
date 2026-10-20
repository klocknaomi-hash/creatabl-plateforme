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
  result: { ideas: { title: string; content: string; platform?: string; hashtags?: string[] }[]; draftIds: string[] } | null;
  sourcesUsed: { title: string; url?: string; source?: string }[];
};

// Couleurs des réseaux : pastille du brouillon (fond, texte).
const NETWORK: Record<string, { label: string; bg: string; fg: string }> = {
  linkedin: { label: "LinkedIn", bg: "#E8F1FB", fg: "#0A66C2" },
  instagram: { label: "Instagram", bg: "#FCE8F1", fg: "#C13584" },
  facebook: { label: "Facebook", bg: "#E7F0FE", fg: "#1877F2" },
  twitter: { label: "X", bg: "#EDEDF0", fg: "#14121F" },
};

const FONT = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

// Construit le sujet et le HTML (tableaux et styles en ligne pour les messageries).
export function buildAgentRunEmail(agentName: string, run: RunSummary, firstName?: string | null) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.creatabl-ia.com";
  const runsLink = `${appUrl}/dashboard/agent-ia?onglet=executions`;
  const settingsLink = `${appUrl}/dashboard/agent-ia?onglet=agents`;
  const ok = run.status === "succeeded";
  const ideas = run.result?.ideas ?? [];
  const draftIds = run.result?.draftIds ?? [];
  const drafts = draftIds.length;
  const sources = run.sourcesUsed ?? [];
  const networks = new Set(ideas.map((i) => i.platform).filter(Boolean));
  const day = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(new Date());
  const date = day.charAt(0).toUpperCase() + day.slice(1);

  const subject = ok
    ? drafts
      ? `${plural(drafts, "post")} prêt${drafts > 1 ? "s" : ""} à publier · ${agentName}`
      : `${plural(ideas.length, "idée")} de posts · ${agentName}`
    : `Votre agent « ${agentName} » n'a pas pu s'exécuter`;
  const preheader = ok
    ? `Votre agent a lu ${plural(sources.length, "source")} et rédigé ${plural(ideas.length, "post")}. Relisez, ajoutez un visuel, publiez.`
    : run.error || "Une erreur est survenue pendant l'exécution.";
  const hello = firstName ? `Bonjour ${esc(firstName)},` : "Bonjour,";

  const stat = (value: number, label: string, last = false) => `
    <td width="33%" align="center" style="padding:18px 8px;${last ? "" : "border-right:1px solid #E8E6F0;"}">
      <div style="font-family:${FONT};font-size:28px;line-height:32px;font-weight:700;color:#14121F;">${value}</div>
      <div style="font-family:${FONT};font-size:12px;line-height:18px;color:#6B6780;text-transform:uppercase;letter-spacing:.06em;">${label}</div>
    </td>`;

  const ideaCards = ideas
    .map((idea, i) => {
      const net = NETWORK[idea.platform ?? ""] ?? { label: "Post", bg: "#F3EEFD", fg: "#5B1BB8" };
      const excerpt = idea.content.length > 320 ? `${idea.content.slice(0, 320).trimEnd()}…` : idea.content;
      const tags = (idea.hashtags ?? []).map((h) => `#${esc(h.replace(/^#/, ""))}`).join(" ");
      const href = draftIds[i] ? `${appUrl}/dashboard/compose?id=${draftIds[i]}` : runsLink;
      return `
      <tr><td style="padding:0 0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E8E6F0;border-radius:14px;background:#FFFFFF;">
          <tr><td style="padding:20px 22px 0;">
            <span style="display:inline-block;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${net.fg};background:${net.bg};padding:5px 10px;border-radius:999px;">${net.label}</span>
            <span style="font-family:${FONT};font-size:12px;color:#6B6780;padding-left:8px;">Brouillon ${i + 1} sur ${ideas.length}</span>
          </td></tr>
          <tr><td style="padding:12px 22px 0;font-family:${FONT};font-size:18px;line-height:26px;font-weight:700;color:#14121F;">${esc(idea.title)}</td></tr>
          <tr><td style="padding:8px 22px 0;font-family:${FONT};font-size:14px;line-height:23px;color:#4B4B63;white-space:pre-line;">${esc(excerpt)}</td></tr>
          ${tags ? `<tr><td style="padding:10px 22px 0;font-family:${FONT};font-size:13px;line-height:20px;color:#7225E3;">${tags}</td></tr>` : ""}
          <tr><td style="padding:16px 22px 20px;">
            <a href="${href}" style="font-family:${FONT};font-size:14px;font-weight:600;color:#7225E3;text-decoration:none;">${draftIds[i] ? "Relire et publier" : "Voir dans Creatabl"} &rarr;</a>
          </td></tr>
        </table>
      </td></tr>`;
    })
    .join("");

  const sourceRows = sources
    .slice(0, 6)
    .map(
      (s, i) => `
      <tr><td style="padding:12px 0;${i ? "border-top:1px solid #E8E6F0;" : ""}">
        <div style="font-family:${FONT};font-size:12px;line-height:18px;color:#6B6780;">${esc(s.source || "Source")}</div>
        <div style="font-family:${FONT};font-size:14px;line-height:21px;font-weight:600;color:#14121F;">${
          s.url ? `<a href="${esc(s.url)}" style="color:#14121F;text-decoration:none;">${esc(s.title)}</a>` : esc(s.title)
        }</div>
      </td></tr>`
    )
    .join("");

  const body = ok
    ? `
      <tr><td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #E8E6F0;border-radius:14px;background:#FFFFFF;">
          <tr>${stat(sources.length, "sources lues")}${stat(ideas.length, ideas.length > 1 ? "posts rédigés" : "post rédigé")}${stat(networks.size, networks.size > 1 ? "réseaux" : "réseau", true)}</tr>
        </table>
      </td></tr>
      <tr><td style="padding:36px 40px 14px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7225E3;">${drafts ? "Vos brouillons" : "Les idées de l'agent"}</td></tr>
      <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${ideaCards}</table></td></tr>
      ${
        sources.length
          ? `<tr><td style="padding:20px 40px 6px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7225E3;">Ce que l'agent a lu</td></tr>
      <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${sourceRows}</table></td></tr>`
          : ""
      }
      <tr><td style="padding:28px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F8F7FC;border-radius:14px;">
          <tr><td style="padding:18px 22px;font-family:${FONT};font-size:14px;line-height:22px;color:#4B4B63;">
            <strong style="color:#14121F;">Le bon réflexe :</strong> relisez chaque post, ajoutez un visuel depuis Canva, puis programmez-le au meilleur moment de la semaine.
          </td></tr>
        </table>
      </td></tr>`
    : `
      <tr><td style="padding:0 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FDECEA;border-radius:14px;">
          <tr><td style="padding:18px 22px;font-family:${FONT};font-size:14px;line-height:22px;color:#B42318;">${esc(run.error || "Une erreur est survenue pendant l'exécution.")}</td></tr>
        </table>
      </td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F1EFF7;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F1EFF7;">
    <tr><td align="center" style="padding:32px 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:26px 40px;border-bottom:1px solid #E8E6F0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
            <td style="font-family:${FONT};font-size:20px;font-weight:700;color:#14121F;">Creatabl.<span style="color:#7225E3;font-style:italic;font-family:Georgia,'Times New Roman',serif;font-weight:400;">ia</span></td>
            <td align="right" style="font-family:${FONT};font-size:12px;color:#6B6780;">${esc(date)}</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;background:#F3EEFD;">
          <div style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#7225E3;">Agent IA · ${esc(agentName)}</div>
          <h1 style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:40px;font-weight:400;color:#14121F;">${
            ok ? (drafts ? `${plural(drafts, "post")} prêt${drafts > 1 ? "s" : ""} à publier` : `${plural(ideas.length, "idée")} pour vous`) : "L'exécution n'a pas abouti"
          }</h1>
          <p style="margin:14px 0 0;font-family:${FONT};font-size:15px;line-height:24px;color:#4B4B63;">${hello} ${
            ok
              ? `votre agent a fait la veille ce matin. Il a lu ${plural(sources.length, "source")} et en a tiré ${plural(ideas.length, "post")}, rédigé${ideas.length > 1 ? "s" : ""} avec votre ton de marque.`
              : "votre agent n'a pas pu terminer sa veille. Voici ce qui s'est passé."
          }</p>
          <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;"><tr>
            <td style="background:#7225E3;border-radius:999px;"><a href="${runsLink}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;">${ok ? "Voir les posts" : "Voir le détail"}</a></td>
          </tr></table>
        </td></tr>
        <tr><td style="height:32px;"></td></tr>
        ${body}
        <tr><td style="height:36px;"></td></tr>
        <tr><td style="padding:24px 40px 32px;border-top:1px solid #E8E6F0;font-family:${FONT};font-size:12px;line-height:19px;color:#6B6780;">
          Vous recevez ce résumé car il est activé sur l'agent « ${esc(agentName)} ».
          <a href="${settingsLink}" style="color:#6B6780;">Gérer les e-mails de cet agent</a>.<br>
          Creatabl.ia · Créez, planifiez, analysez.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

export async function sendAgentRunEmail(to: string, agentName: string, run: RunSummary, firstName?: string | null) {
  const { subject, html } = buildAgentRunEmail(agentName, run, firstName);
  if (!configured) {
    console.log(`[agents] e-mail non envoyé (Resend non configuré) → ${to} : ${subject}`);
    return { sent: false };
  }
  await new Resend(key).emails.send({ from: `Creatabl.ia <${from}>`, to, subject, html });
  return { sent: true };
}
