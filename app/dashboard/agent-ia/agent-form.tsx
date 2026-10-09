"use client"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import NetworkLogo, { toNetwork } from "@/components/ds/NetworkLogo"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  PLATFORMS,
  SCHEDULE_LABELS,
  SOURCE_LABELS,
  SOURCES,
  type AgentConfig,
  type AgentSchedule,
} from "@/lib/agents/templates"

const PLATFORM_LABELS: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", twitter: "X" }

// Réglages d'un agent, dans une fenêtre du design system : création (après la
// description ou un modèle) et modification depuis « Mes agents ».
export function AgentForm({
  title,
  initial,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string
  initial: AgentConfig
  submitLabel: string
  onSubmit: (config: AgentConfig) => Promise<string | null>
  onClose: () => void
}) {
  const [config, setConfig] = useState<AgentConfig>(initial)
  const [urlsText, setUrlsText] = useState(initial.urls.join("\n"))
  const [keywordsText, setKeywordsText] = useState(initial.keywords.join(", "))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstField.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose, saving])

  const set = <K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) => setConfig((c) => ({ ...c, [key]: value }))
  const toggle = (key: "sources" | "platforms", value: string) =>
    setConfig((c) => {
      const list = c[key] as string[]
      return { ...c, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] } as AgentConfig
    })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload: AgentConfig = {
      ...config,
      urls: urlsText.split(/\s+/).map((u) => u.trim()).filter(Boolean),
      keywords: keywordsText.split(",").map((k) => k.trim()).filter(Boolean),
    }
    const err = await onSubmit(payload)
    setSaving(false)
    if (err) setError(err)
  }

  return (
    <div className="cr-modal-scrim fixed inset-0 z-[90] overflow-y-auto" style={{ placeItems: "start center" }} onClick={() => !saving && onClose()}>
      <form
        className="cr-modal"
        style={{ maxWidth: 640, margin: "auto 0" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-form-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="cr-modal-head">
          <h4 id="agent-form-title">{title}</h4>
          <button type="button" className="cr-iconbtn" aria-label="Fermer" onClick={onClose} disabled={saving}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 px-6 py-5">
          <div className="cr-field">
            <label className="cr-label" htmlFor="agent-name">Nom de l&apos;agent</label>
            <input ref={firstField} id="agent-name" className="cr-input" value={config.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="cr-field">
            <label className="cr-label" htmlFor="agent-goal">Objectif</label>
            <textarea id="agent-goal" className="cr-textarea" rows={3} value={config.goal} maxLength={1000} onChange={(e) => set("goal", e.target.value)} />
            <span className="cr-help">Ce que l&apos;agent doit chercher et produire, en une ou deux phrases.</span>
          </div>

          <fieldset className="cr-field">
            <legend className="cr-label">Sources</legend>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <button key={s} type="button" className="cr-net cr-net--sm" aria-pressed={config.sources.includes(s)} onClick={() => toggle("sources", s)}>
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          </fieldset>

          {config.sources.includes("web") && (
            <div className="cr-field">
              <label className="cr-label" htmlFor="agent-urls">Pages web à lire</label>
              <textarea
                id="agent-urls"
                className="cr-textarea"
                rows={2}
                placeholder="https://exemple.com/article (une adresse par ligne, 5 maximum)"
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
              />
            </div>
          )}

          <div className="cr-field">
            <label className="cr-label" htmlFor="agent-keywords">Mots-clés de recherche</label>
            <input
              id="agent-keywords"
              className="cr-input"
              placeholder="ex. bijoux artisanaux, mode durable"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
            />
            <span className="cr-help">Séparés par des virgules. Sans mot-clé, l&apos;agent s&apos;appuie sur la description de votre marque.</span>
          </div>

          <fieldset className="cr-field">
            <legend className="cr-label">Réseaux visés</legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const net = toNetwork(p)
                return (
                  <button key={p} type="button" className="cr-net cr-net--sm" aria-pressed={config.platforms.includes(p)} onClick={() => toggle("platforms", p)}>
                    {net && <NetworkLogo name={net} size={14} />}
                    {PLATFORM_LABELS[p]}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="cr-field">
              <label className="cr-label" htmlFor="agent-output">Résultat</label>
              <select id="agent-output" className="cr-select" value={config.output} onChange={(e) => set("output", e.target.value === "ideas" ? "ideas" : "drafts")}>
                <option value="drafts">Brouillons de posts</option>
                <option value="ideas">Idées seulement</option>
              </select>
            </div>
            <div className="cr-field">
              <label className="cr-label" htmlFor="agent-count">Posts par exécution</label>
              <select id="agent-count" className="cr-select" value={config.postCount} onChange={(e) => set("postCount", Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="cr-field">
              <label className="cr-label" htmlFor="agent-schedule">Fréquence</label>
              <select id="agent-schedule" className="cr-select" value={config.schedule} onChange={(e) => set("schedule", e.target.value as AgentSchedule)}>
                {(Object.keys(SCHEDULE_LABELS) as AgentSchedule[]).map((s) => (
                  <option key={s} value={s}>{SCHEDULE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          {config.schedule !== "manual" && (
            <>
              <p className="cr-help -mt-2">
                L&apos;agent se lance tout seul à 7 h (heure de Paris){config.schedule === "weekly" ? ", chaque lundi" : ", chaque jour"}. Vous pouvez aussi le lancer à tout moment.
              </p>
              <label className="flex items-center justify-between gap-4 rounded-[12px] border border-[#E8E6F0] p-4">
                <span>
                  <span className="block text-sm font-semibold text-[#14121F]">Résumé par e-mail</span>
                  <span className="block text-xs text-[#6B6780]">Recevoir les posts préparés après chaque lancement automatique.</span>
                </span>
                <Switch checked={config.notifyEmail !== false} onCheckedChange={(v: boolean) => set("notifyEmail", v)} />
              </label>
            </>
          )}

          {error && <p className="cr-help cr-help--error" role="alert">{error}</p>}
        </div>

        <div className="cr-modal-foot">
          <span className="text-sm text-[#6B6780]">Modifiable à tout moment.</span>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button type="submit" loading={saving}>{submitLabel}</Button>
        </div>
      </form>
    </div>
  )
}
