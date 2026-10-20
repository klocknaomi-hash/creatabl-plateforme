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

// Identité visuelle de la marque cliente : son nom et les photos de sa médiathèque.
export type EmailBrand = { name?: string | null; images?: string[] };

const NETWORK: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", twitter: "X" };

// Palette éditoriale chaude (taupe, crème) et accent violet Creatabl pour les actions.
const C = {
  page: "#EFEAE3",
  taupe: "#8C7B6B",
  taupeDark: "#6F604F",
  cream: "#F7F2EB",
  sand: "#E9E0D4",
  ink: "#2B2420",
  muted: "#6F655C",
  line: "#DDD3C6",
  violet: "#7225E3",
  white: "#FFFFFF",
};
const SANS = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

// Recadrage côté ImageKit quand l'image y est hébergée (poids et cadrage maîtrisés).
function sized(url: string, w: number, h: number) {
  if (!/ik\.imagekit\.io/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}tr=w-${w * 2},h-${h * 2},fo-auto`;
}

const img = (url: string, w: number, h: number, alt: string, radius = 0) =>
  `<img src="${esc(sized(url, w, h))}" width="${w}" height="${h}" alt="${esc(alt)}" style="display:block;width:100%;max-width:${w}px;height:auto;border:0;border-radius:${radius}px;object-fit:cover;">`;

const button = (href: string, label: string, dark = false) => `
  <table cellpadding="0" cellspacing="0" role="presentation"><tr>
    <td style="background:${dark ? C.ink : C.white};border-radius:6px;">
      <a href="${href}" style="display:inline-block;padding:12px 22px;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:.02em;color:${dark ? C.white : C.ink};text-decoration:none;">${label} &rarr;</a>
    </td>
  </tr></table>`;

// Construit le sujet et le HTML (tableaux et styles en ligne pour les messageries).
export function buildAgentRunEmail(agentName: string, run: RunSummary, firstName?: string | null, brand: EmailBrand = {}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.creatabl-ia.com";
  const runsLink = `${appUrl}/dashboard/agent-ia?onglet=executions`;
  const settingsLink = `${appUrl}/dashboard/agent-ia?onglet=agents`;
  const mediaLink = `${appUrl}/dashboard/mediatheque`;
  const ok = run.status === "succeeded";
  const ideas = run.result?.ideas ?? [];
  const draftIds = run.result?.draftIds ?? [];
  const drafts = draftIds.length;
  const sources = run.sourcesUsed ?? [];
  const networks = new Set(ideas.map((i) => i.platform).filter(Boolean));
  const images = (brand.images ?? []).filter(Boolean);
  const brandName = brand.name?.trim() || "";
  const hello = firstName ? `Bonjour ${esc(firstName)},` : "Bonjour,";

  const subject = ok
    ? drafts
      ? `Votre veille : ${plural(drafts, "post")} prêt${drafts > 1 ? "s" : ""} à publier`
      : `Votre veille : ${plural(ideas.length, "idée")} de posts`
    : `Votre agent « ${agentName} » n'a pas pu s'exécuter`;
  const preheader = ok
    ? `${plural(sources.length, "source")} lue${sources.length > 1 ? "s" : ""}, ${plural(ideas.length, "post")} rédigé${ideas.length > 1 ? "s" : ""} avec votre ton de marque.`
    : run.error || "Une erreur est survenue pendant l'exécution.";

  // ─── En-tête : bandeau taupe, titre éditorial, photo de la marque ───
  const hero = `
    <tr><td style="background:${C.taupe};padding:36px 40px 0;text-align:center;">
      <div style="font-family:${SERIF};font-size:20px;color:${C.cream};">${brandName ? esc(brandName) : "Creatabl.ia"}</div>
      <div style="font-family:${SANS};font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${C.sand};margin-top:6px;">Agent IA · ${esc(agentName)}</div>
      <h1 style="margin:26px 0 0;font-family:${SERIF};font-size:46px;line-height:50px;font-weight:500;color:${C.white};">${
        ok ? "Votre veille<br>de la semaine" : "Votre veille<br>n'a pas abouti"
      }</h1>
      <p style="margin:14px 0 0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.cream};">${
        ok
          ? `${drafts ? `${plural(drafts, "post")} prêt${drafts > 1 ? "s" : ""} à publier` : `${plural(ideas.length, "idée")} de posts`}, tirés de ${plural(sources.length, "source")}.`
          : "Voici ce qui s'est passé."
      }</p>
      <div style="height:${images[0] ? 28 : 36}px;"></div>
      ${images[0] ? img(images[0], 560, 400, brandName || "Visuel de la marque", 4) : ""}
    </td></tr>
    <tr><td style="background:${C.taupe};padding:28px 56px 40px;text-align:center;">
      <p style="margin:0;font-family:${SANS};font-size:14px;line-height:23px;color:${C.cream};">${hello} ${
        ok
          ? "votre agent a parcouru l'actualité de votre secteur ce matin. Il en a retenu l'essentiel et a rédigé des posts avec votre ton de marque. Il ne reste qu'à relire, ajouter un visuel et publier."
          : "votre agent n'a pas pu terminer sa veille."
      }</p>
      <div style="height:22px;"></div>
      <table cellpadding="0" cellspacing="0" role="presentation" align="center"><tr><td>${button(runsLink, ok ? "Voir les posts" : "Voir le détail")}</td></tr></table>
    </td></tr>`;

  if (!ok) {
    return { subject, html: wrap(subject, preheader, hero + errorBlock(run.error) + footer(agentName, settingsLink)) };
  }

  // ─── Chiffres de la veille : trois pastilles rondes ───
  const badge = (value: number, label: string) => `
    <td width="33%" align="center" valign="top" style="padding:0 6px;">
      <table cellpadding="0" cellspacing="0" role="presentation" align="center"><tr>
        <td width="64" height="64" align="center" valign="middle" style="width:64px;height:64px;border-radius:50%;background:${C.taupe};font-family:${SERIF};font-size:28px;color:${C.white};">${value}</td>
      </tr></table>
      <div style="font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};margin-top:10px;">${label}</div>
    </td>`;
  const stats = `
    <tr><td style="background:${C.cream};padding:40px 40px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
        ${badge(sources.length, sources.length > 1 ? "Sources lues" : "Source lue")}
        ${badge(ideas.length, ideas.length > 1 ? "Posts rédigés" : "Post rédigé")}
        ${badge(networks.size, networks.size > 1 ? "Réseaux visés" : "Réseau visé")}
      </tr></table>
    </td></tr>`;

  // ─── Posts prêts : cartes en deux colonnes, avec un visuel de la marque ───
  const card = (i: number) => {
    const idea = ideas[i];
    const href = draftIds[i] ? `${appUrl}/dashboard/compose?id=${draftIds[i]}` : runsLink;
    const pic = images[(i + 1) % Math.max(images.length, 1)] ?? images[0];
    const excerpt = idea.content.replace(/\s+/g, " ").trim();
    const short = excerpt.length > 150 ? `${excerpt.slice(0, 150).trimEnd()}…` : excerpt;
    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.white};border:1px solid ${C.line};border-radius:14px;">
        ${pic ? `<tr><td style="padding:14px 14px 0;">${img(pic, 236, 236, idea.title, 10)}</td></tr>` : ""}
        <tr><td style="padding:16px 18px 0;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${C.taupeDark};">${esc(NETWORK[idea.platform ?? ""] ?? "Post")}</td></tr>
        <tr><td style="padding:6px 18px 0;font-family:${SERIF};font-size:22px;line-height:26px;font-weight:500;color:${C.ink};">${esc(idea.title)}</td></tr>
        <tr><td style="padding:8px 18px 0;font-family:${SANS};font-size:13px;line-height:20px;color:${C.muted};">${esc(short)}</td></tr>
        <tr><td style="padding:16px 18px 18px;">${button(href, draftIds[i] ? "Relire et publier" : "Voir le post", true)}</td></tr>
      </table>`;
  };
  const rows: string[] = [];
  for (let i = 0; i < ideas.length; i += 2) {
    const right = i + 1 < ideas.length;
    rows.push(`
      <tr>
        <td class="col" width="${right ? "50%" : "100%"}" valign="top" style="padding:0 ${right ? 8 : 0}px 16px 0;">${card(i)}</td>
        ${right ? `<td class="col" width="50%" valign="top" style="padding:0 0 16px 8px;">${card(i + 1)}</td>` : ""}
      </tr>`);
  }
  const posts = `
    <tr><td style="background:${C.cream};padding:32px 40px 0;text-align:center;">
      <div style="font-family:${SERIF};font-size:30px;color:${C.ink};">${drafts ? "Vos posts prêts" : "Les idées de votre agent"}</div>
      <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin-top:6px;">Rédigés avec votre ton de marque, à relire avant publication.</div>
    </td></tr>
    <tr><td style="background:${C.cream};padding:24px 40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows.join("")}</table>
    </td></tr>`;

  // ─── Ce que l'agent a lu ───
  const reading = sources.length
    ? `
    <tr><td style="background:${C.sand};padding:36px 40px 12px;">
      <div style="font-family:${SERIF};font-size:26px;color:${C.ink};">Ce que l'agent a lu</div>
    </td></tr>
    <tr><td style="background:${C.sand};padding:0 40px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${sources
        .slice(0, 5)
        .map(
          (s, i) => `
        <tr><td style="padding:14px 0;${i ? `border-top:1px solid ${C.line};` : ""}">
          <div style="font-family:${SANS};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${C.taupeDark};">${esc(s.source || "Source")}</div>
          <div style="font-family:${SANS};font-size:15px;line-height:22px;font-weight:600;color:${C.ink};margin-top:4px;">${
            s.url ? `<a href="${esc(s.url)}" style="color:${C.ink};text-decoration:none;">${esc(s.title)}</a>` : esc(s.title)
          }</div>
        </td></tr>`
        )
        .join("")}</table>
    </td></tr>`
    : "";

  // ─── Vos visuels : mosaïque de la médiathèque pour accompagner les posts ───
  const tiles = images.slice(0, 6);
  const mosaic =
    tiles.length >= 3
      ? `
    <tr><td style="background:${C.cream};padding:40px 40px 8px;text-align:center;">
      <div style="font-family:${SERIF};font-size:28px;color:${C.ink};">Vos visuels disponibles</div>
      <div style="font-family:${SANS};font-size:13px;color:${C.muted};margin-top:6px;">À associer à vos posts depuis la médiathèque ou Canva.</div>
    </td></tr>
    <tr><td style="background:${C.cream};padding:20px 40px 8px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${[0, 3]
          .filter((start) => tiles[start])
          .map(
            (start) => `<tr>${[0, 1, 2]
              .map((k) => {
                const t = tiles[start + k];
                return `<td width="33%" style="padding:4px;">${t ? img(t, 180, 180, "Visuel de la médiathèque", 6) : ""}</td>`;
              })
              .join("")}</tr>`
          )
          .join("")}
      </table>
    </td></tr>
    <tr><td style="background:${C.cream};padding:12px 40px 40px;" align="center">
      <table cellpadding="0" cellspacing="0" role="presentation" align="center"><tr><td>${button(mediaLink, "Ouvrir la médiathèque", true)}</td></tr></table>
    </td></tr>`
      : `<tr><td style="background:${C.cream};height:24px;"></td></tr>`;

  return { subject, html: wrap(subject, preheader, hero + stats + posts + reading + mosaic + footer(agentName, settingsLink)) };
}

function errorBlock(error: string | null) {
  return `
    <tr><td style="background:${C.cream};padding:32px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FDECEA;border-radius:10px;">
        <tr><td style="padding:18px 22px;font-family:${SANS};font-size:14px;line-height:22px;color:#B42318;">${esc(error || "Une erreur est survenue pendant l'exécution.")}</td></tr>
      </table>
    </td></tr>`;
}

function footer(agentName: string, settingsLink: string) {
  return `
    <tr><td style="background:${C.white};padding:32px 40px;border-top:1px solid ${C.line};">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td valign="bottom" style="font-family:${SERIF};font-size:30px;line-height:30px;color:${C.ink};">Creatabl<span style="color:${C.violet};font-style:italic;">.ia</span></td>
        <td valign="bottom" align="right" style="font-family:${SANS};font-size:11px;line-height:17px;color:${C.muted};">
          Résumé de l'agent « ${esc(agentName)} ».<br>
          <a href="${settingsLink}" style="color:${C.muted};">Gérer ces e-mails</a>
        </td>
      </tr></table>
    </td></tr>`;
}

function wrap(subject: string, preheader: string, rows: string) {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&display=swap" rel="stylesheet">
<style>@media (max-width:620px){.col{display:block!important;width:100%!important;padding:0 0 16px 0!important}}</style></head>
<body style="margin:0;padding:0;background:${C.page};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${C.page};">
    <tr><td align="center" style="padding:28px 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:640px;">
        <tr><td style="background:${C.sand};padding:9px 20px;text-align:center;font-family:${SANS};font-size:11px;letter-spacing:.06em;color:${C.muted};">Votre veille hebdomadaire, préparée par Creatabl.ia</td></tr>
        ${rows}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendAgentRunEmail(to: string, agentName: string, run: RunSummary, firstName?: string | null, brand?: EmailBrand) {
  const { subject, html } = buildAgentRunEmail(agentName, run, firstName, brand);
  if (!configured) {
    console.log(`[agents] e-mail non envoyé (Resend non configuré) → ${to} : ${subject}`);
    return { sent: false };
  }
  await new Resend(key).emails.send({ from: `Creatabl.ia <${from}>`, to, subject, html });
  return { sent: true };
}
