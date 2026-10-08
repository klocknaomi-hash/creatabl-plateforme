"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, ExternalLink, Film, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvaIcon } from "@/components/platform-icons";
import { CanvaDesignPicker } from "@/components/compose/canva-design-picker";
import { EmptyState, Alert } from "@/components/ds";

type Item = { id: string; url: string; name: string; size: string | null; mimeType: string | null; createdAt: string };

function formatSize(size: string | null) {
  const n = Number(size);
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

export function MediaLibrary({ initialItems, failed }: { initialItems: Item[]; failed: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () =>
      items.filter((i) => {
        if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (kind === "image") return !i.mimeType?.startsWith("video");
        if (kind === "video") return i.mimeType?.startsWith("video");
        return true;
      }),
    [items, query, kind]
  );

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "L'import a échoué");
      setItems((prev) => [{ ...data, createdAt: data.createdAt ?? new Date().toISOString() }, ...prev]);
      toast.success("Média importé");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "L'import a échoué");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4">
      {failed && (
        <Alert tone="error" title="Impossible de charger la médiathèque">
          Vérifiez votre connexion puis rechargez la page.
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="cr-control" style={{ flex: 1, minWidth: 220, maxWidth: 420 }}>
          <Search size={18} aria-hidden="true" />
          <span className="cr-sr">Rechercher un média</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un média…" />
        </label>
        <div className="cr-segment" role="tablist" aria-label="Type de média">
          {(["all", "image", "video"] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} className="cr-tab" onClick={() => setKind(k)}>
              {k === "all" ? "Tout" : k === "image" ? "Images" : "Vidéos"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <CanvaDesignPicker
            onUpload={(f) => {
              setItems((prev) => [{ id: f.fileId, url: f.url, name: f.name, size: null, mimeType: "image/png", createdAt: new Date().toISOString() }, ...prev]);
              router.refresh();
            }}
          >
            <Button variant="outline">
              <CanvaIcon size={16} />
              Importer depuis Canva
            </Button>
          </CanvaDesignPicker>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <Button loading={uploading} onClick={() => inputRef.current?.click()} className="bg-[image:var(--gradient-cta)] hover:bg-[#7225E3] hover:bg-none">
            {!uploading && <Upload className="size-4" />}
            {uploading ? "Import…" : "Importer un fichier"}
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          illustration="posts"
          title={items.length === 0 ? "Votre médiathèque est vide" : "Aucun média trouvé"}
          text={
            items.length === 0
              ? "Importez une image ou une vidéo, ou récupérez vos designs Canva : ils resteront disponibles pour tous vos posts."
              : "Modifiez votre recherche ou le filtre."
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Médias">
          {visible.map((i) => {
            const isVideo = i.mimeType?.startsWith("video");
            return (
              <li key={i.id} className="cr-post" style={{ padding: 10, gap: 10 }}>
                <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#F8F7FC]">
                  {isVideo ? (
                    <div className="grid size-full place-items-center text-[#6B6780]">
                      <Film size={28} aria-hidden="true" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.url} alt="" className="size-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#14121F]" title={i.name}>{i.name}</p>
                  <p className="text-xs text-[#6B6780]">
                    {[new Date(i.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), formatSize(i.size)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="cr-iconbtn"
                    style={{ width: 32, height: 32 }}
                    aria-label={`Copier le lien de ${i.name}`}
                    onClick={() => navigator.clipboard.writeText(i.url).then(() => toast.success("Lien copié"))}
                  >
                    <Copy size={16} aria-hidden="true" />
                  </button>
                  <a className="cr-iconbtn" style={{ width: 32, height: 32 }} href={i.url} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${i.name}`}>
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
