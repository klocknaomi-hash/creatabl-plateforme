"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Folder, FolderOpen, Loader2, RefreshCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { CanvaIcon } from "@/components/platform-icons";
import { EmptyState } from "@/components/ds";

interface CanvaDesign {
  id: string;
  title?: string;
  thumbnail?: { url: string; width?: number; height?: number };
  urls?: { thumbnail?: string; edit_url?: string; view_url?: string };
  updated_at?: number | string;
}

interface CanvaFolder {
  id: string;
  name: string;
}

interface CanvaDesignPickerProps {
  children: React.ReactNode;
  onUpload: (file: { url: string; fileId: string; name: string }) => void;
}

type Sort = "modified_descending" | "title_ascending";

function updatedLabel(value?: number | string) {
  if (value === undefined) return "";
  const d = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `Modifié le ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
}

// Export PNG (haute définition, sans perte par défaut chez Canva), attente du résultat,
// puis envoi dans la médiathèque Creatabl. Même enchaînement qu'avant, pour un design.
async function importDesign(design: CanvaDesign) {
  const startRes = await fetch("/api/canva/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ designId: design.id }),
  });
  if (!startRes.ok) throw new Error("Échec de l'export Canva");
  const startData = await startRes.json();
  const jobId = startData.job?.id || startData.export?.id || startData.id;
  if (!jobId) throw new Error("Identifiant d'export manquant");

  let finalUrl: string | null = null;
  for (let attempt = 0; attempt < 30 && !finalUrl; attempt++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(`/api/canva/export/${jobId}`);
    if (!statusRes.ok) throw new Error("Erreur de statut d'export");
    const statusData = await statusRes.json();
    const job = statusData.job || statusData.export || statusData;
    const status = String(job?.status ?? "").toLowerCase();
    if (status === "success") finalUrl = job.urls?.[0] ?? null;
    else if (status === "failed") throw new Error("L'export Canva a échoué");
  }
  if (!finalUrl) throw new Error("Délai d'attente dépassé");

  const blob = await (await fetch(finalUrl)).blob();
  const safeName = (design.title || "design-canva").replace(/[^\p{L}\p{N}_ -]+/gu, "").trim() || "design-canva";
  const file = new File([blob], `${safeName}.png`, { type: blob.type || "image/png" });
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch("/api/media/upload", { method: "POST", body: formData });
  const data = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(data.error || data.message || "L'envoi a échoué");
  return { url: data.url as string, fileId: data.fileId as string, name: data.name as string };
}

// Canva Picker du design system : dossiers à gauche, designs en grille, recherche, tri,
// sélection multiple, export PNG haute définition puis import.
export function CanvaDesignPicker({ children, onUpload }: CanvaDesignPickerProps) {
  const [open, setOpen] = useState(false);
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [folders, setFolders] = useState<CanvaFolder[]>([]);
  const [foldersAvailable, setFoldersAvailable] = useState(true);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<"auth" | "error" | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState<Sort>("modified_descending");
  const [selected, setSelected] = useState<CanvaDesign[]>([]);
  const [importing, setImporting] = useState<{ done: number; total: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (more = false) => {
      if (more) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }
      try {
        const params = new URLSearchParams({ sort_by: sort });
        if (more && continuation) params.set("continuation", continuation);
        let url: string;
        if (folderId) url = `/api/canva/folders/${encodeURIComponent(folderId)}?${params}`;
        else {
          if (debounced) {
            params.set("query", debounced);
            params.set("sort_by", "relevance");
          }
          url = `/api/canva/designs?${params}`;
        }
        const res = await fetch(url);
        if (res.status === 401) {
          setError("auth");
          return;
        }
        if (!res.ok) throw new Error("load");
        const data = await res.json();
        const items: CanvaDesign[] = data.items || data.designs || [];
        setDesigns((prev) => (more ? [...prev, ...items] : items));
        setContinuation(data.continuation ?? null);
      } catch {
        if (!more) setError("error");
        else toast.error("Impossible de charger plus de designs");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [continuation, debounced, folderId, sort]
  );

  // Ouverture : dossiers + designs. Changement de dossier, de tri ou de recherche : rechargement.
  useEffect(() => {
    if (!open) return;
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folderId, sort, debounced]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/canva/folders")
      .then((r) => (r.ok ? r.json() : { folders: [], available: false }))
      .then((d) => {
        setFolders(d.folders ?? []);
        setFoldersAvailable(!!d.available);
      })
      .catch(() => setFoldersAvailable(false));
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !importing && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, importing]);

  // La sélection est conservée d'un dossier ou d'une recherche à l'autre.
  const toggle = (design: CanvaDesign) =>
    setSelected((prev) => (prev.some((d) => d.id === design.id) ? prev.filter((d) => d.id !== design.id) : [...prev, design]));

  async function runImport() {
    const chosen = selected;
    if (chosen.length === 0) return;
    setImporting({ done: 0, total: chosen.length });
    let ok = 0;
    for (const design of chosen) {
      try {
        const file = await importDesign(design);
        onUpload(file);
        ok++;
      } catch (e) {
        toast.error(`${design.title || "Design"} : ${e instanceof Error ? e.message : "import impossible"}`);
      }
      setImporting((s) => (s ? { ...s, done: s.done + 1 } : s));
    }
    setImporting(null);
    if (ok > 0) {
      toast.success(ok > 1 ? `${ok} designs importés` : "Design importé");
      setSelected([]);
      setOpen(false);
    }
  }

  const count = selected.length;
  const folderName = folderId ? folders.find((f) => f.id === folderId)?.name : null;

  const modal = open
    ? createPortal(
        <div className="cr-modal-scrim fixed inset-0 z-[90]" onClick={() => !importing && setOpen(false)}>
          <div
            className="cr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="canva-picker-title"
            style={{ maxHeight: "calc(100vh - 48px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cr-modal-head">
              <CanvaIcon size={28} />
              <h4 id="canva-picker-title">Importer depuis Canva</h4>
              {error === "auth" ? (
                <span className="cr-badge cr-badge--warning">À reconnecter</span>
              ) : (
                <span className="cr-badge cr-badge--success">Connecté</span>
              )}
              <button ref={closeRef} type="button" className="cr-iconbtn" aria-label="Fermer" onClick={() => !importing && setOpen(false)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="cr-canva" style={{ minHeight: 0, overflow: "hidden" }}>
              <nav className="cr-canva-folders" aria-label="Dossiers Canva">
                <div className="cr-side-group" style={{ paddingTop: 0 }}>Dossiers</div>
                <button
                  type="button"
                  className="cr-side-item"
                  aria-current={!folderId ? "page" : undefined}
                  onClick={() => setFolderId(null)}
                  style={{ border: 0, background: !folderId ? undefined : "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                >
                  {!folderId ? <FolderOpen size={18} aria-hidden="true" /> : <Folder size={18} aria-hidden="true" />}
                  Tous les designs
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="cr-side-item"
                    aria-current={folderId === f.id ? "page" : undefined}
                    onClick={() => setFolderId(f.id)}
                    style={{ border: 0, background: folderId === f.id ? undefined : "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                  >
                    {folderId === f.id ? <FolderOpen size={18} aria-hidden="true" /> : <Folder size={18} aria-hidden="true" />}
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
                {!foldersAvailable && (
                  <p className="px-3 pt-2 text-xs leading-[18px] text-[#6B6780]">
                    Vos dossiers Canva apparaîtront ici dès que l&apos;accès aux dossiers sera activé pour la connexion Canva.
                  </p>
                )}
              </nav>

              <div className="cr-canva-main" style={{ overflowY: "auto", maxHeight: "calc(100vh - 220px)" }}>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cr-control" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={18} aria-hidden="true" />
                    <span className="cr-sr">Rechercher un design</span>
                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        if (folderId) setFolderId(null);
                      }}
                      placeholder={folderName ? `Rechercher dans ${folderName}` : "Rechercher un design…"}
                    />
                  </label>
                  <select className="cr-select" style={{ width: "auto" }} aria-label="Trier" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                    <option value="modified_descending">Modifiés récemment</option>
                    <option value="title_ascending">Nom (A à Z)</option>
                  </select>
                  <button type="button" className="cr-iconbtn" aria-label="Actualiser" onClick={() => load(false)} disabled={loading}>
                    <RefreshCcw size={18} className={loading ? "animate-spin" : ""} aria-hidden="true" />
                  </button>
                </div>

                {loading ? (
                  <div className="cr-canva-grid" aria-busy="true">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="grid gap-2">
                        <div className="aspect-square animate-pulse rounded-[8px] bg-[#F8F7FC]" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-[#F8F7FC]" />
                      </div>
                    ))}
                  </div>
                ) : error === "auth" ? (
                  <EmptyState bordered={false} illustration="posts" title="Connexion Canva expirée" text="Reconnectez Canva pour retrouver vos designs.">
                    <a href="/dashboard/settings/connections" className="cr-btn cr-btn--primary">Reconnecter Canva</a>
                  </EmptyState>
                ) : error ? (
                  <EmptyState bordered={false} illustration="posts" title="Impossible de charger vos designs" text="Vérifiez votre connexion puis réessayez.">
                    <button type="button" className="cr-btn cr-btn--secondary" onClick={() => load(false)}>Réessayer</button>
                  </EmptyState>
                ) : designs.length === 0 ? (
                  <EmptyState
                    bordered={false}
                    illustration="posts"
                    title={debounced ? "Aucun design trouvé" : "Aucun design dans ce dossier"}
                    text={debounced ? "Essayez un autre mot-clé." : "Créez un design dans Canva : il apparaîtra ici."}
                  />
                ) : (
                  <>
                    <div className="cr-canva-grid">
                      {designs.map((design) => {
                        const thumb = design.thumbnail?.url || design.urls?.thumbnail;
                        const pressed = selected.some((d) => d.id === design.id);
                        return (
                          <button key={design.id} type="button" className="cr-design" aria-pressed={pressed} onClick={() => toggle(design)}>
                            <span style={{ position: "relative", display: "block" }}>
                              <span className="cr-visual cr-visual--tint" style={{ aspectRatio: "1 / 1", borderRadius: 8, outline: "1px solid var(--border)", outlineOffset: -1, overflow: "hidden", display: "block" }}>
                                {thumb ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={thumb} alt="" className="size-full object-cover" loading="lazy" />
                                ) : (
                                  <span className="grid size-full place-items-center"><CanvaIcon size={28} /></span>
                                )}
                              </span>
                              <span className="cr-sel"><Check size={14} aria-hidden="true" /></span>
                            </span>
                            <strong>{design.title || "Design sans titre"}</strong>
                            <small>{updatedLabel(design.updated_at)}</small>
                          </button>
                        );
                      })}
                    </div>
                    {continuation && (
                      <div className="flex justify-center">
                        <button type="button" className="cr-btn cr-btn--secondary cr-btn--sm" onClick={() => load(true)} disabled={loadingMore} aria-busy={loadingMore || undefined}>
                          {loadingMore && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                          Afficher plus de designs
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="cr-modal-foot">
              <span>
                {count > 0 ? (
                  <>
                    <strong style={{ color: "var(--ink)" }}>{count} design{count > 1 ? "s" : ""}</strong> sélectionné{count > 1 ? "s" : ""} · exporté{count > 1 ? "s" : ""} en PNG haute définition
                  </>
                ) : (
                  "Sélectionnez un ou plusieurs designs"
                )}
              </span>
              <button type="button" className="cr-btn cr-btn--ghost" onClick={() => setOpen(false)} disabled={!!importing}>
                Annuler
              </button>
              <button type="button" className="cr-btn cr-btn--primary" disabled={count === 0 || !!importing} aria-busy={!!importing || undefined} onClick={runImport}>
                {importing && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
                {importing
                  ? `Import ${Math.min(importing.done + 1, importing.total)} sur ${importing.total}…`
                  : count > 0
                    ? `Importer ${count} design${count > 1 ? "s" : ""}`
                    : "Importer"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <span style={{ display: "contents" }} onClick={() => setOpen(true)}>
        {children}
      </span>
      {modal}
    </>
  );
}
