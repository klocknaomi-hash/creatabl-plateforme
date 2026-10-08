// Contraintes de publication par réseau, utilisées par l'aperçu (Post Preview) et par la
// validation du Composer. Valeurs des documentations officielles des réseaux (octobre 2026).

export type NetworkId = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok" | "youtube" | "pinterest";

export type NetworkRule = {
  label: string;
  maxChars: number;
  /** Caractères visibles avant « … plus » dans le fil. */
  foldAt: number;
  maxMedia: number;
  /** Le réseau refuse un post sans média. */
  requiresMedia: boolean;
  /** Le réseau n'accepte que la vidéo. */
  videoOnly: boolean;
  /** Ratio d'affichage du média dans l'aperçu (largeur / hauteur). */
  ratio: string;
  ratioLabel: string;
};

export const NETWORK_RULES: Record<NetworkId, NetworkRule> = {
  instagram: { label: "Instagram", maxChars: 2200, foldAt: 125, maxMedia: 10, requiresMedia: true, videoOnly: false, ratio: "4 / 5", ratioLabel: "4:5 (portrait) ou 1:1" },
  facebook: { label: "Facebook", maxChars: 63206, foldAt: 480, maxMedia: 10, requiresMedia: false, videoOnly: false, ratio: "1.91 / 1", ratioLabel: "1,91:1" },
  linkedin: { label: "LinkedIn", maxChars: 3000, foldAt: 210, maxMedia: 9, requiresMedia: false, videoOnly: false, ratio: "1.91 / 1", ratioLabel: "1,91:1 ou 1:1" },
  twitter: { label: "X", maxChars: 280, foldAt: 280, maxMedia: 4, requiresMedia: false, videoOnly: false, ratio: "16 / 9", ratioLabel: "16:9" },
  tiktok: { label: "TikTok", maxChars: 2200, foldAt: 150, maxMedia: 1, requiresMedia: true, videoOnly: true, ratio: "9 / 16", ratioLabel: "9:16 (vertical)" },
  youtube: { label: "YouTube", maxChars: 5000, foldAt: 150, maxMedia: 1, requiresMedia: true, videoOnly: true, ratio: "16 / 9", ratioLabel: "16:9" },
  pinterest: { label: "Pinterest", maxChars: 500, foldAt: 100, maxMedia: 1, requiresMedia: true, videoOnly: false, ratio: "2 / 3", ratioLabel: "2:3" },
};

export function ruleFor(platform: string): NetworkRule | null {
  const key = (platform === "x" ? "twitter" : platform.toLowerCase()) as NetworkId;
  return NETWORK_RULES[key] ?? null;
}

export type NetworkIssue = { platform: string; level: "error" | "warning"; message: string };

const isVideo = (m: { url: string; mimeType?: string | null }) =>
  (m.mimeType ?? "").startsWith("video") || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(m.url);

/** Problèmes bloquants (error) ou à surveiller (warning) pour chaque réseau sélectionné. */
export function checkPost(
  content: string,
  media: { url: string; mimeType?: string | null }[],
  platforms: string[]
): NetworkIssue[] {
  const issues: NetworkIssue[] = [];
  const length = Array.from(content).length;
  for (const p of platforms) {
    const r = ruleFor(p);
    if (!r) continue;
    if (length > r.maxChars) {
      issues.push({ platform: p, level: "error", message: `${r.label} : le texte dépasse ${r.maxChars.toLocaleString("fr-FR")} caractères (${length.toLocaleString("fr-FR")}). Raccourcissez-le.` });
    } else if (length > r.foldAt && r.foldAt < r.maxChars) {
      issues.push({ platform: p, level: "warning", message: `${r.label} : seuls les ${r.foldAt} premiers caractères s'affichent avant « … plus ». Placez l'essentiel au début.` });
    }
    if (r.requiresMedia && media.length === 0) {
      issues.push({ platform: p, level: "error", message: `${r.label} : ajoutez ${r.videoOnly ? "une vidéo" : "au moins une image ou une vidéo"}.` });
    }
    if (r.videoOnly && media.length > 0 && !media.some(isVideo)) {
      issues.push({ platform: p, level: "error", message: `${r.label} n'accepte que la vidéo.` });
    }
    if (media.length > r.maxMedia) {
      issues.push({ platform: p, level: "error", message: `${r.label} : ${r.maxMedia} média${r.maxMedia > 1 ? "s" : ""} maximum (${media.length} ajoutés).` });
    }
  }
  return issues;
}

/** Limite de caractères la plus stricte parmi les réseaux sélectionnés. */
export function strictestLimit(platforms: string[]) {
  const rules = platforms.map(ruleFor).filter((r): r is NetworkRule => !!r);
  if (rules.length === 0) return { max: 2200, label: null as string | null };
  const r = rules.reduce((a, b) => (b.maxChars < a.maxChars ? b : a));
  return { max: r.maxChars, label: r.label };
}

export function strictestMedia(platforms: string[]) {
  const rules = platforms.map(ruleFor).filter((r): r is NetworkRule => !!r);
  if (rules.length === 0) return 10;
  return Math.min(...rules.map((r) => r.maxMedia));
}
