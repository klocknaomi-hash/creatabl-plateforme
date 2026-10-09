// Browserbase : recherche web et lecture de pages pour les agents IA.
// Deux appels HTTP simples (pas de navigateur complet) :
//   POST https://api.browserbase.com/v1/search  { query, numResults }
//   POST https://api.browserbase.com/v1/fetch   { url, allowRedirects, format }
// Activé quand BROWSERBASE_API_KEY est défini. Les quotas sont partagés par toute la
// plateforme ; le plafond mensuel est vérifié avant chaque appel (voir monthlyUsage).
import type { SourceItem } from "./sources";

const API = "https://api.browserbase.com/v1";

export const browserbaseEnabled = () => Boolean(process.env.BROWSERBASE_API_KEY);

// Plafonds mensuels (toute la plateforme). Par défaut, un peu sous le plan gratuit
// (1 000 recherches et 1 000 lectures) ; à relever quand le plan évolue.
export const MONTHLY_LIMITS = {
  search: Number(process.env.BROWSERBASE_MONTHLY_SEARCH_LIMIT) || 900,
  fetch: Number(process.env.BROWSERBASE_MONTHLY_FETCH_LIMIT) || 900,
};

// Par exécution : de quoi bien travailler sans vider le quota.
export const PER_RUN = { searches: 2, fetches: 5 };

async function call<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "X-BB-API-Key": process.env.BROWSERBASE_API_KEY ?? "" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.message || `Browserbase ${res.status}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

type SearchResponse = {
  results?: { id?: string; url: string; title?: string; author?: string; publishedDate?: string }[];
};

export async function browserbaseSearch(query: string, numResults = 6): Promise<SourceItem[]> {
  const data = await call<SearchResponse>("/search", { query, numResults }, 20000);
  return (data.results ?? [])
    .filter((r) => r.url)
    .map((r) => {
      let host = "";
      try {
        host = new URL(r.url).hostname.replace(/^www\./, "");
      } catch {
        host = "web";
      }
      return { title: r.title || r.url, url: r.url, source: `Recherche web · ${host}` };
    });
}

type FetchResponse = { statusCode?: number; content?: string; contentType?: string };

const htmlToText = (html: string) =>
  html
    .replace(/<(head|script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Lit une page et renvoie son texte (Markdown si Browserbase le fournit).
export async function browserbaseFetch(url: string): Promise<SourceItem | null> {
  let data: FetchResponse;
  try {
    data = await call<FetchResponse>("/fetch", { url, allowRedirects: true, format: "markdown" }, 30000);
  } catch (err) {
    // Ancienne version de l'API sans le paramètre « format » : nouvel essai en brut.
    if ((err as { status?: number }).status !== 400) throw err;
    data = await call<FetchResponse>("/fetch", { url, allowRedirects: true }, 30000);
  }
  const raw = data.content ?? "";
  if (!raw || (data.statusCode && data.statusCode >= 400)) return null;
  const isHtml = /<html|<body|<div|<p[\s>]/i.test(raw.slice(0, 3000));
  const title =
    (isHtml ? raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] : raw.match(/^#\s+(.+)$/m)?.[1])?.trim() || url;
  const text = isHtml ? htmlToText(raw) : raw.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\n{3,}/g, "\n\n");
  let host = "web";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {}
  return { title: title.slice(0, 200), url, source: host, excerpt: text.slice(0, 3000) };
}
