"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowUp,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Minus,
  MessagesSquare,
  Play,
  Radar,
  TrendingUp,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Alert, Badge, EmptyState, PlanGate, formatPostDate } from "@/components/ds"
import NetworkLogo, { NetworkStack, toNetwork } from "@/components/ds/NetworkLogo"
import { useConfirm } from "@/components/ds/confirm"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAccess } from "@/hooks/useAccess"
import {
  AGENT_TEMPLATES,
  MAX_AGENTS,
  SCHEDULE_LABELS,
  SOURCE_LABELS,
  type AgentConfig,
  type AgentSchedule,
  type AgentSource,
  type AgentTemplate,
} from "@/lib/agents/templates"
import { AgentForm } from "./agent-form"
import { SpecializedAgents } from "./specialized-agents"

type Agent = AgentConfig & {
  id: string
  status: "active" | "paused"
  lastRunAt: string | null
  createdAt: string
}

type Run = {
  id: string
  agentId: string
  agentName: string
  status: "running" | "succeeded" | "failed"
  trigger: string
  steps: { label: string; status: "done" | "failed" | "skipped"; detail?: string }[]
  sourcesUsed: { title: string; url?: string; source: string }[]
  result: { ideas: { title: string; content: string; platform?: string; hashtags?: string[] }[]; draftIds: string[] } | null
  error: string | null
  startedAt: string
  finishedAt: string | null
}

type Tab = "creer" | "agents" | "executions" | "modeles"
const TABS: { id: Tab; label: string }[] = [
  { id: "creer", label: "Créer un agent" },
  { id: "agents", label: "Mes agents" },
  { id: "executions", label: "Exécutions" },
  { id: "modeles", label: "Modèles" },
]

const TEMPLATE_ICONS: Record<AgentTemplate["icon"], React.ComponentType<{ size?: number }>> = {
  radar: Radar,
  eye: Eye,
  reddit: MessagesSquare,
  trend: TrendingUp,
  article: FileText,
  calendar: CalendarDays,
}

const iconFor = (templateId?: string | null) => {
  const t = AGENT_TEMPLATES.find((x) => x.id === templateId)
  return t ? TEMPLATE_ICONS[t.icon] : Bot
}

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, message: data?.message || "Une erreur est survenue. Réessayez." }
    return { ok: true, data: data as T }
  } catch {
    return { ok: false, message: "Connexion impossible. Vérifiez votre réseau et réessayez." }
  }
}

// Page Agent IA : 4 onglets (Créer un agent, Mes agents, Exécutions, Modèles).
// Les agents automatiques sont réservés au plan Business, 3 par espace.
export function AgentIA() {
  const access = useAccess()
  const business = access.team
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get("onglet"))?.id ?? "creer") as Tab

  const [agents, setAgents] = useState<Agent[] | null>(null)
  const [runs, setRuns] = useState<Run[] | null>(null)
  const [form, setForm] = useState<{ mode: "create" | "edit"; agentId?: string; config: AgentConfig } | null>(null)
  const [openRun, setOpenRun] = useState<string | null>(null)

  const go = useCallback(
    (t: Tab) => {
      const q = new URLSearchParams(params.toString())
      q.set("onglet", t)
      router.replace(`${pathname}?${q.toString()}`, { scroll: false })
    },
    [params, pathname, router]
  )

  const loadAgents = useCallback(async () => {
    const r = await api<{ agents: Agent[] }>("/api/agents")
    if (r.ok) setAgents(r.data.agents)
    else setAgents([])
  }, [])
  const loadRuns = useCallback(async () => {
    const r = await api<{ runs: Run[] }>("/api/agents/runs")
    if (r.ok) setRuns(r.data.runs)
    else setRuns([])
  }, [])

  useEffect(() => {
    if (!business) return
    // Chargement asynchrone : l'état n'est mis à jour qu'après la réponse.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAgents()
    loadRuns()
  }, [business, loadAgents, loadRuns])

  const full = (agents?.length ?? 0) >= MAX_AGENTS

  async function saveAgent(config: AgentConfig): Promise<string | null> {
    if (!form) return null
    const r =
      form.mode === "create"
        ? await api<{ agent: Agent }>("/api/agents", { method: "POST", body: JSON.stringify(config) })
        : await api<{ agent: Agent }>(`/api/agents/${form.agentId}`, { method: "PATCH", body: JSON.stringify(config) })
    if (!r.ok) return r.message
    toast.success(form.mode === "create" ? `Agent « ${r.data.agent.name} » créé` : "Agent mis à jour")
    setForm(null)
    await loadAgents()
    if (form.mode === "create") go("agents")
    return null
  }

  function useTemplate(t: AgentTemplate) {
    if (full) {
      toast.error(`Vous avez déjà ${MAX_AGENTS} agents. Supprimez-en un pour utiliser ce modèle.`)
      return
    }
    setForm({ mode: "create", config: { ...t.config, template: t.id } })
  }

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.01em] text-[#14121F]">Agent IA</h1>
          <p className="mt-1 text-sm text-[#4B4B63]">
            Des agents qui font la veille pour vous et préparent vos posts à partir de sources récentes.
          </p>
        </div>
        {business ? (
          <div className="cr-meter min-w-[200px]">
            <div className="cr-meter-head">
              <span>Agents</span>
              <span>{agents?.length ?? 0}/{MAX_AGENTS}</span>
            </div>
            <div className="cr-bar" role="progressbar" aria-valuenow={agents?.length ?? 0} aria-valuemin={0} aria-valuemax={MAX_AGENTS} aria-label="Agents utilisés">
              <span style={{ width: `${Math.round(((agents?.length ?? 0) / MAX_AGENTS) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <Badge tone="violet" plain>Plan Business</Badge>
        )}
      </div>

      <nav className="cr-tabs overflow-x-auto whitespace-nowrap" role="tablist" aria-label="Sections de l'Agent IA">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" className="cr-tab" aria-selected={tab === t.id} onClick={() => go(t.id)}>
            {t.label}
            {t.id === "agents" && business && agents && <span className="cr-count">{agents.length}</span>}
            {t.id === "executions" && business && runs && runs.length > 0 && <span className="cr-count">{runs.length}</span>}
          </button>
        ))}
      </nav>

      {tab !== "modeles" && !business ? (
        <PlanGate
          feature="Les agents IA automatiques"
          plan="Business"
          description="Créez jusqu'à 3 agents qui font la veille de votre secteur, lisent des pages web et préparent vos brouillons de posts."
        >
          <button type="button" className="cr-btn cr-btn--secondary" onClick={() => go("modeles")}>Voir les agents spécialisés</button>
        </PlanGate>
      ) : tab === "creer" ? (
        <CreateTab full={full} onDrafted={(config) => setForm({ mode: "create", config })} onTemplate={useTemplate} onSeeAll={() => go("modeles")} />
      ) : tab === "agents" ? (
        <AgentsTab
          agents={agents}
          onCreate={() => go("creer")}
          onEdit={(a) => setForm({ mode: "edit", agentId: a.id, config: a })}
          onChanged={loadAgents}
          onRan={(run) => {
            loadRuns()
            loadAgents()
            setOpenRun(run.id)
            if (run.status === "succeeded") {
              const n = run.result?.draftIds.length ?? 0
              toast.success(n ? `${n} brouillon${n > 1 ? "s" : ""} prêt${n > 1 ? "s" : ""}` : "Idées prêtes", {
                action: { label: "Voir le résultat", onClick: () => go("executions") },
              })
            } else {
              toast.error(run.error || "L'exécution a échoué.", { action: { label: "Voir le détail", onClick: () => go("executions") } })
            }
          }}
        />
      ) : tab === "executions" ? (
        <RunsTab runs={runs} openRun={openRun} setOpenRun={setOpenRun} onCreate={() => go(agents?.length ? "agents" : "creer")} />
      ) : (
        <TemplatesTab business={business} pro={access.aiAdvanced} full={full} onTemplate={useTemplate} />
      )}

      {form && (
        <AgentForm
          title={form.mode === "create" ? "Vérifiez votre agent" : "Modifier l'agent"}
          submitLabel={form.mode === "create" ? "Créer l'agent" : "Enregistrer"}
          initial={form.config}
          onSubmit={saveAgent}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  )
}

/* ─────────── Créer un agent ─────────── */
function CreateTab({
  full,
  onDrafted,
  onTemplate,
  onSeeAll,
}: {
  full: boolean
  onDrafted: (c: AgentConfig) => void
  onTemplate: (t: AgentTemplate) => void
  onSeeAll: () => void
}) {
  const [text, setText] = useState("")
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (text.trim().length < 8 || loading || full) return
    setLoading(true)
    const r = await api<{ config: AgentConfig }>("/api/agents/draft", { method: "POST", body: JSON.stringify({ description: text }) })
    setLoading(false)
    if (!r.ok) {
      toast.error(r.message)
      return
    }
    const t = AGENT_TEMPLATES.find((x) => x.id === templateId)
    onDrafted({ ...r.data.config, template: t?.id ?? r.data.config.template ?? null })
  }

  const starters = AGENT_TEMPLATES.filter((t) => ["veille-secteur", "surveiller-concurrent", "article-en-posts"].includes(t.id))

  return (
    <div className="mx-auto grid w-full max-w-[880px] gap-8 py-2">
      <div className="grid gap-1">
        <h2 className="font-heading text-xl font-semibold text-[#14121F]">Créer un nouvel agent</h2>
        <p className="text-sm text-[#4B4B63]">Décrivez ce que l&apos;agent doit faire : son sujet, ses sources, le résultat attendu.</p>
      </div>

      {full && (
        <Alert tone="info" title={`Vous avez atteint ${MAX_AGENTS} agents`}>
          Supprimez ou modifiez un agent existant dans « Mes agents » pour en créer un nouveau.
        </Alert>
      )}

      <form
        onSubmit={submit}
        className="grid gap-3 rounded-[12px] border border-[#E8E6F0] bg-white p-4 shadow-[0_12px_32px_rgba(114,37,227,0.08)] focus-within:border-[#7225E3]"
      >
        <label htmlFor="agent-describe" className="cr-sr">Décrivez l&apos;agent que vous voulez créer</label>
        <textarea
          id="agent-describe"
          rows={4}
          value={text}
          disabled={full}
          onChange={(e) => {
            setText(e.target.value)
            setTemplateId(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit()
          }}
          placeholder="Ex. : Chaque lundi, fais la veille de l'actualité de la bijouterie artisanale et prépare 3 posts LinkedIn."
          className="w-full resize-none border-0 bg-transparent p-1 text-base leading-6 text-[#14121F] outline-none placeholder:text-[#6B6780] disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#6B6780]">Collez l&apos;adresse d&apos;une page pour que l&apos;agent la lise.</span>
          <button
            type="submit"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#7225E3] text-white transition-colors hover:bg-[#5B1BB8] disabled:cursor-not-allowed disabled:bg-[#E8E6F0] disabled:text-[#6B6780]"
            disabled={loading || full || text.trim().length < 8}
            aria-label="Préparer l'agent"
            aria-busy={loading || undefined}
          >
            {loading ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <ArrowUp size={20} aria-hidden="true" />}
          </button>
        </div>
      </form>

      <div className="-mt-4 flex flex-wrap gap-2" aria-label="Suggestions">
        {AGENT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className="cr-net cr-net--sm"
            disabled={full}
            onClick={() => {
              setText(t.prompt)
              setTemplateId(t.id)
            }}
          >
            {t.chip}
          </button>
        ))}
      </div>

      <section className="grid gap-4" aria-labelledby="starters-title">
        <div className="flex items-center justify-between">
          <h3 id="starters-title" className="font-heading text-lg font-semibold text-[#14121F]">Bien démarrer</h3>
          <button type="button" className="cr-link text-sm" onClick={onSeeAll}>Voir tous les modèles</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {starters.map((t) => (
            <TemplateCard key={t.id} t={t} disabled={full} onUse={() => onTemplate(t)} />
          ))}
        </div>
      </section>
    </div>
  )
}

function TemplateCard({ t, disabled, onUse, locked }: { t: AgentTemplate; disabled?: boolean; locked?: boolean; onUse: () => void }) {
  const Icon = TEMPLATE_ICONS[t.icon]
  return (
    <button
      type="button"
      onClick={onUse}
      disabled={disabled || locked}
      className="group grid h-full content-start gap-3 rounded-[12px] border border-[#E8E6F0] bg-white p-5 text-left transition-colors hover:border-[#7225E3] disabled:cursor-not-allowed disabled:hover:border-[#E8E6F0]"
    >
      <span className="cr-icon-tile" aria-hidden="true"><Icon size={20} /></span>
      <span className="font-semibold text-[#14121F]">{t.title}</span>
      <span className="text-sm leading-5 text-[#4B4B63]">{t.description}</span>
      <span className="flex flex-wrap gap-1.5">
        {t.config.sources.map((s) => (
          <Badge key={s} plain>{SOURCE_LABELS[s]}</Badge>
        ))}
      </span>
      <span className="text-sm font-semibold text-[#7225E3]">{locked ? "Plan Business" : "Utiliser ce modèle"}</span>
    </button>
  )
}

/* ─────────── Mes agents ─────────── */
function AgentsTab({
  agents,
  onCreate,
  onEdit,
  onChanged,
  onRan,
}: {
  agents: Agent[] | null
  onCreate: () => void
  onEdit: (a: Agent) => void
  onChanged: () => void
  onRan: (run: Run) => void
}) {
  const confirm = useConfirm()
  const [running, setRunning] = useState<string | null>(null)

  if (!agents) return <ListSkeleton />
  if (agents.length === 0) {
    return (
      <EmptyState illustration="posts" title="Aucun agent pour l'instant" text="Décrivez ce que vous voulez automatiser ou partez d'un modèle.">
        <button type="button" className="cr-btn cr-btn--primary" onClick={onCreate}>Créer un agent</button>
      </EmptyState>
    )
  }

  async function run(a: Agent) {
    setRunning(a.id)
    const r = await api<{ run: Run }>(`/api/agents/${a.id}/run`, { method: "POST" })
    setRunning(null)
    if (!r.ok) {
      toast.error(r.message)
      return
    }
    onRan({ ...r.data.run, agentName: a.name })
  }

  async function setStatus(a: Agent, active: boolean) {
    const r = await api(`/api/agents/${a.id}`, { method: "PATCH", body: JSON.stringify({ status: active ? "active" : "paused" }) })
    if (!r.ok) toast.error(r.message)
    onChanged()
  }

  async function remove(a: Agent) {
    const ok = await confirm({
      title: `Supprimer l'agent « ${a.name} » ?`,
      description: "Son historique d'exécutions sera supprimé. Les brouillons déjà créés restent dans Publications.",
      confirmLabel: "Supprimer l'agent",
    })
    if (!ok) return
    const r = await api(`/api/agents/${a.id}`, { method: "DELETE" })
    if (r.ok) toast.success("Agent supprimé")
    else toast.error(r.message)
    onChanged()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {agents.map((a) => {
        const Icon = iconFor(a.template)
        const isRunning = running === a.id
        return (
          <article key={a.id} className="grid content-start gap-4 rounded-[12px] border border-[#E8E6F0] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="cr-icon-tile shrink-0" aria-hidden="true"><Icon size={20} /></span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-[#14121F]">{a.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-sm text-[#4B4B63]">{a.goal}</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-[#4B4B63]">
                <span className="cr-sr">Agent actif</span>
                <Switch checked={a.status === "active"} onCheckedChange={(v: boolean) => setStatus(a, v)} />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={a.status === "active" ? "success" : "neutral"}>{a.status === "active" ? "Actif" : "En pause"}</Badge>
              {(a.sources as AgentSource[]).map((s) => (
                <Badge key={s} plain>{SOURCE_LABELS[s]}</Badge>
              ))}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[#6B6780]">Réseaux</dt>
                <dd className="mt-1"><NetworkStack platforms={a.platforms} /></dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B6780]">Fréquence</dt>
                <dd className="mt-1 text-[#14121F]">{SCHEDULE_LABELS[a.schedule as AgentSchedule]}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B6780]">Résultat</dt>
                <dd className="mt-1 text-[#14121F]">{a.output === "drafts" ? `${a.postCount} brouillon${a.postCount > 1 ? "s" : ""}` : `${a.postCount} idée${a.postCount > 1 ? "s" : ""}`}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B6780]">Dernière exécution</dt>
                <dd className="mt-1 text-[#14121F]">{a.lastRunAt ? formatPostDate(a.lastRunAt) : "Jamais"}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-2 border-t border-[#E8E6F0] pt-4">
              <Button size="sm" loading={isRunning} disabled={a.status !== "active" || (running !== null && !isRunning)} onClick={() => run(a)}>
                {!isRunning && <Play aria-hidden="true" />}
                {isRunning ? "Exécution en cours…" : "Lancer maintenant"}
              </Button>
              <Button size="sm" variant="outline" disabled={isRunning} onClick={() => onEdit(a)}>Modifier</Button>
              <Button size="sm" variant="ghost" className="ml-auto text-[#B42318] hover:text-[#B42318]" disabled={isRunning} onClick={() => remove(a)}>
                Supprimer
              </Button>
            </div>
            {isRunning && (
              <p className="text-xs text-[#6B6780]" role="status">
                L&apos;agent cherche dans ses sources puis rédige. Cela prend en général 15 à 40 secondes.
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}

/* ─────────── Exécutions ─────────── */
const RUN_STATUS: Record<Run["status"], { label: string; tone: "success" | "error" | "info" }> = {
  succeeded: { label: "Réussie", tone: "success" },
  failed: { label: "Échec", tone: "error" },
  running: { label: "En cours", tone: "info" },
}

function RunsTab({
  runs,
  openRun,
  setOpenRun,
  onCreate,
}: {
  runs: Run[] | null
  openRun: string | null
  setOpenRun: (id: string | null) => void
  onCreate: () => void
}) {
  if (!runs) return <ListSkeleton />
  if (runs.length === 0) {
    return (
      <EmptyState illustration="chart" title="Aucune exécution pour l'instant" text="Lancez un agent : chaque exécution apparaîtra ici avec ses sources et ses résultats.">
        <button type="button" className="cr-btn cr-btn--primary" onClick={onCreate}>Lancer un agent</button>
      </EmptyState>
    )
  }

  return (
    <div className="grid gap-3">
      {runs.map((run) => (
        <RunRow key={run.id} run={run} open={openRun === run.id} onToggle={() => setOpenRun(openRun === run.id ? null : run.id)} />
      ))}
    </div>
  )
}

function RunRow({ run, open, onToggle }: { run: Run; open: boolean; onToggle: () => void }) {
  const s = RUN_STATUS[run.status] ?? RUN_STATUS.running
  const ideas = run.result?.ideas ?? []
  const drafts = run.result?.draftIds.length ?? 0
  const summary =
    run.status === "failed"
      ? run.error || "L'exécution a échoué."
      : run.status === "running"
        ? "Exécution en cours…"
        : drafts
          ? `${drafts} brouillon${drafts > 1 ? "s" : ""} créé${drafts > 1 ? "s" : ""} · ${run.sourcesUsed.length} source${run.sourcesUsed.length > 1 ? "s" : ""}`
          : `${ideas.length} idée${ideas.length > 1 ? "s" : ""} · ${run.sourcesUsed.length} source${run.sourcesUsed.length > 1 ? "s" : ""}`

  return (
    <article className={`rounded-[12px] border bg-white ${run.status === "failed" ? "border-[#B42318]/40" : "border-[#E8E6F0]"}`}>
      <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={onToggle} aria-expanded={open}>
        <Badge tone={s.tone}>{s.label}</Badge>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-[#14121F]">{run.agentName}</span>
          <span className={`block truncate text-sm ${run.status === "failed" ? "text-[#B42318]" : "text-[#4B4B63]"}`}>{summary}</span>
        </span>
        <span className="hidden text-sm text-[#6B6780] sm:block">{formatPostDate(run.startedAt)}</span>
        {open ? <ChevronUp size={18} className="text-[#6B6780]" aria-hidden="true" /> : <ChevronDown size={18} className="text-[#6B6780]" aria-hidden="true" />}
      </button>

      {open && (
        <div className="grid gap-5 border-t border-[#E8E6F0] p-4 lg:grid-cols-[260px_1fr]">
          <div className="grid content-start gap-5">
            <section>
              <h4 className="mb-2 text-xs font-semibold text-[#6B6780]">Étapes</h4>
              <ol className="grid gap-2">
                {run.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                        st.status === "done" ? "bg-[#E7F6EE] text-[#0E7445]" : st.status === "failed" ? "bg-[#FDECEA] text-[#B42318]" : "bg-[#F8F7FC] text-[#6B6780]"
                      }`}
                      aria-hidden="true"
                    >
                      {st.status === "done" ? <Check size={12} /> : st.status === "failed" ? <X size={12} /> : <Minus size={12} />}
                    </span>
                    <span>
                      <span className="text-[#14121F]">{st.label}</span>
                      {st.detail && <span className="block text-xs text-[#6B6780]">{st.detail}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            {run.sourcesUsed.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold text-[#6B6780]">Sources consultées</h4>
                <ul className="grid gap-2">
                  {run.sourcesUsed.slice(0, 8).map((src, i) => (
                    <li key={i} className="text-sm">
                      {src.url ? (
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="cr-link line-clamp-2">
                          {src.title}
                          <ExternalLink size={12} className="ml-1 inline" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="line-clamp-2 text-[#14121F]">{src.title}</span>
                      )}
                      <span className="block text-xs text-[#6B6780]">{src.source}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section className="grid content-start gap-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs font-semibold text-[#6B6780]">{drafts ? "Brouillons créés" : "Idées proposées"}</h4>
              {drafts > 0 && (
                <Link href="/dashboard/posts" className="cr-btn cr-btn--secondary cr-btn--sm">Voir dans Publications</Link>
              )}
            </div>
            {ideas.length === 0 ? (
              <p className="text-sm text-[#6B6780]">Aucun résultat pour cette exécution.</p>
            ) : (
              ideas.map((idea, i) => {
                const net = idea.platform ? toNetwork(idea.platform) : null
                return (
                  <div key={i} className="grid gap-2 rounded-[12px] border border-[#E8E6F0] p-4">
                    <div className="flex items-center gap-2">
                      {net && <NetworkLogo name={net} size={16} />}
                      <span className="text-sm font-semibold text-[#14121F]">{idea.title || `Post ${i + 1}`}</span>
                      <Badge tone="violet" plain>Généré par l&apos;IA</Badge>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-[#4B4B63]">{idea.content}</p>
                    {idea.hashtags && idea.hashtags.length > 0 && <p className="text-sm text-[#7225E3]">{idea.hashtags.join(" ")}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText([idea.content, idea.hashtags?.join(" ")].filter(Boolean).join("\n\n"))
                          toast.success("Texte copié")
                        }}
                      >
                        <Copy aria-hidden="true" />
                        Copier
                      </Button>
                      {run.result?.draftIds[i] && (
                        <Link href={`/dashboard/compose?id=${run.result.draftIds[i]}`} className="cr-btn cr-btn--ghost cr-btn--sm">
                          Ouvrir le brouillon
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </section>
        </div>
      )}
    </article>
  )
}

/* ─────────── Modèles ─────────── */
function TemplatesTab({ business, pro, full, onTemplate }: { business: boolean; pro: boolean; full: boolean; onTemplate: (t: AgentTemplate) => void }) {
  return (
    <div className="grid gap-10">
      <section className="grid gap-4" aria-labelledby="tpl-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="tpl-title" className="font-heading text-xl font-semibold text-[#14121F]">Modèles d&apos;agents</h2>
            <p className="mt-1 text-sm text-[#4B4B63]">Des agents prêts à l&apos;emploi, à ajuster avant de les créer.</p>
          </div>
          {!business && <Badge tone="violet" plain>Plan Business</Badge>}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AGENT_TEMPLATES.map((t) => (
            <TemplateCard key={t.id} t={t} locked={!business} disabled={full} onUse={() => onTemplate(t)} />
          ))}
        </div>
      </section>

      <section className="grid gap-4" aria-labelledby="specialized-title">
        <div>
          <h2 id="specialized-title" className="font-heading text-xl font-semibold text-[#14121F]">Agents spécialisés</h2>
          <p className="mt-1 text-sm text-[#4B4B63]">Des assistants instantanés pour écrire, trouver des accroches, des hashtags ou des idées de visuels.</p>
        </div>
        {pro ? (
          <SpecializedAgents />
        ) : (
          <PlanGate
            feature="Les agents spécialisés"
            plan="Pro"
            description="Rédacteur, accroches, hashtags, visuels et idées de tendances, dans votre ton de marque."
          />
        )}
      </section>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
      {[0, 1].map((i) => (
        <div key={i} className="h-52 animate-pulse rounded-[12px] border border-[#E8E6F0] bg-white" />
      ))}
    </div>
  )
}

