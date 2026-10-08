import type React from "react";
import { CircleCheck, CircleX, Clock, Info, MoreHorizontal, Sparkles, TriangleAlert, X } from "lucide-react";
import { NetworkStack } from "@/components/ds/NetworkLogo";

// Composants du design system Creatabl.ia (classes cr-* de app/creatabl-ds.css),
// partagés par les pages de la plateforme.

/* ---------- Statut d'une publication ---------- */
type BadgeTone = "info" | "success" | "error" | "warning" | "violet" | "neutral";

export const POST_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Brouillon", tone: "neutral" },
  scheduled: { label: "Programmé", tone: "info" },
  published: { label: "Publié", tone: "success" },
  failed: { label: "Échec", tone: "error" },
  pending: { label: "À valider", tone: "warning" },
  edited: { label: "Modifié", tone: "neutral" },
  ai: { label: "Généré par l'IA", tone: "violet" },
};

// Badge du design system : le point coloré accompagne toujours un mot.
export function Badge({ tone = "neutral", plain = false, children }: { tone?: BadgeTone; plain?: boolean; children: React.ReactNode }) {
  const cls = ["cr-badge", tone !== "neutral" ? `cr-badge--${tone}` : "", plain ? "cr-badge--plain" : ""].filter(Boolean).join(" ");
  return <span className={cls}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const s = POST_STATUS[status] ?? POST_STATUS.draft;
  if (status === "ai") {
    return (
      <Badge tone="violet" plain>
        <Sparkles size={12} aria-hidden="true" />
        {s.label}
      </Badge>
    );
  }
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/* ---------- Alert ---------- */
const ALERT_ICONS = { success: CircleCheck, info: Info, warning: TriangleAlert, error: CircleX };

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
}: {
  tone?: "success" | "info" | "warning" | "error";
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
}) {
  const Icon = ALERT_ICONS[tone];
  return (
    <div className={`cr-alert cr-alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span data-icon className="shrink-0"><Icon size={20} aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <strong>{title}</strong>
        {children && <p>{children}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2 self-center">{action}</div>}
      {onDismiss && (
        <button type="button" className="cr-iconbtn shrink-0" style={{ width: 32, height: 32 }} aria-label="Fermer" onClick={onDismiss}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* ---------- Date au format du design system : « Mar. 14 oct. · 9 h 30 » ---------- */
export function formatPostDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  const cap = day.charAt(0).toUpperCase() + day.slice(1);
  const time = `${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}`;
  return `${cap} · ${time}`;
}

/* ---------- PostCard ---------- */
export function PostCard({
  content,
  platforms,
  status,
  date,
  mediaUrl,
  footNote,
  errorMessage,
  aiGenerated = false,
  actions,
}: {
  content: string;
  platforms: string[];
  status: string;
  date?: string | Date | null;
  mediaUrl?: string | null;
  footNote?: string;
  errorMessage?: string | null;
  aiGenerated?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <article className={`cr-post h-full${status === "failed" ? " cr-post--failed" : ""}`}>
      <div className="cr-post-head">
        <NetworkStack platforms={platforms} />
        <span className="flex items-center gap-1.5">
          {aiGenerated && <StatusBadge status="ai" />}
          <StatusBadge status={status} />
        </span>
      </div>
      <div className="cr-post-body" style={mediaUrl ? undefined : { gridTemplateColumns: "1fr" }}>
        <p>{content}</p>
        {mediaUrl && (
          <div className="cr-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt="" className="size-full object-cover" />
          </div>
        )}
      </div>
      <div className="cr-post-foot">
        <span>
          <Clock size={14} aria-hidden="true" />
          {[formatPostDate(date), status === "failed" ? errorMessage || "publication refusée par le réseau" : footNote].filter(Boolean).join(" · ")}
        </span>
        {actions ?? (
          <span className="cr-post-more" aria-hidden="true">
            <MoreHorizontal size={18} />
          </span>
        )}
      </div>
    </article>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyIllustration({ kind = "calendar" }: { kind?: "calendar" | "chart" | "posts" }) {
  if (kind === "chart") {
    return (
      <svg className="cr-illu" width="200" height="140" viewBox="0 0 200 140" aria-hidden="true">
        <rect className="paper stroke" x="24" y="14" width="152" height="112" rx="12" />
        <path className="stroke" d="M44 104h112" />
        <rect className="tint" x="54" y="76" width="16" height="28" rx="4" />
        <rect className="tint" x="80" y="60" width="16" height="44" rx="4" />
        <rect className="tint2" x="106" y="68" width="16" height="36" rx="4" />
        <rect className="tint" x="132" y="50" width="16" height="54" rx="4" />
        <circle className="brand" cx="150" cy="36" r="12" />
        <path d="M150 30v12M144 36h12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "posts") {
    return (
      <svg className="cr-illu" width="200" height="140" viewBox="0 0 200 140" aria-hidden="true">
        <rect className="soft" x="38" y="22" width="132" height="104" rx="12" />
        <rect className="paper stroke" x="28" y="12" width="132" height="104" rx="12" />
        <rect className="tint2" x="44" y="28" width="40" height="40" rx="8" />
        <path className="stroke" d="M96 34h48M96 46h40M96 58h28M44 84h100M44 96h72" />
        <circle className="brand" cx="156" cy="108" r="14" />
        <path d="M156 101v14M149 108h14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="cr-illu" width="200" height="140" viewBox="0 0 200 140" aria-hidden="true">
      <rect className="soft" x="20" y="18" width="160" height="112" rx="12" />
      <rect className="paper stroke" x="34" y="10" width="132" height="112" rx="12" />
      <path className="stroke" d="M34 36h132" />
      <path className="stroke" d="M62 4v14M138 4v14" />
      <rect className="tint" x="46" y="48" width="26" height="22" rx="6" />
      <rect className="tint" x="87" y="48" width="26" height="22" rx="6" />
      <rect className="tint2" x="128" y="48" width="26" height="22" rx="6" />
      <rect className="tint" x="46" y="82" width="26" height="22" rx="6" />
      <rect className="brand" x="87" y="82" width="26" height="22" rx="6" />
      <rect className="tint" x="128" y="82" width="26" height="22" rx="6" />
      <path d="M95 93l4 4 7-8" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyState({
  title,
  text,
  illustration = "calendar",
  children,
  bordered = true,
}: {
  title: string;
  text?: React.ReactNode;
  illustration?: "calendar" | "chart" | "posts";
  children?: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className="cr-empty"
      style={bordered ? { background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--cr-radius-md)" } : undefined}
    >
      <EmptyIllustration kind={illustration} />
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {children && <div className="cr-empty-actions">{children}</div>}
    </div>
  );
}

/* ---------- StatCard ---------- */
export function StatCard({
  label,
  icon,
  value,
  delta,
  down = false,
  context,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  value: React.ReactNode;
  delta?: React.ReactNode;
  down?: boolean;
  context?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className="cr-stat">
      <span className="cr-stat-label">{icon}{label}</span>
      <span className="cr-stat-value">{value}</span>
      {children}
      {(delta || context) && (
        <div className="cr-stat-foot">
          {delta ? <span className={`cr-delta${down ? " cr-delta--down" : ""}`}>{delta}</span> : <span />}
          {context && <span>{context}</span>}
        </div>
      )}
    </article>
  );
}

/* ---------- En-tête de page ---------- */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.01em] text-[#14121F]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#4B4B63]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Fonction réservée à un plan ---------- */
export function PlanGate({
  feature,
  plan,
  description,
  children,
}: {
  feature: string;
  plan: "Pro" | "Business";
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="cr-empty" style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--cr-radius-md)" }}>
      <span className="cr-icon-tile" style={{ width: 56, height: 56 }} aria-hidden="true">
        <Sparkles size={26} />
      </span>
      <Badge tone="violet" plain>Plan {plan}</Badge>
      <h4>{feature} est inclus à partir du plan {plan}</h4>
      <p>{description}</p>
      <div className="cr-empty-actions">
        <a href="/dashboard/billing" className="cr-btn cr-btn--primary">Voir les plans</a>
        {children}
      </div>
    </div>
  );
}
