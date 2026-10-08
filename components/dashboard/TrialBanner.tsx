"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sparkles, Timer, X } from "lucide-react"

export type TrialInfo = {
  startedAt: string | null
  endsAt: string
  trialPlan: string
  selectedPlan: string | null
  scheduledCount?: number
}

const PLAN_NAMES: Record<string, string> = { free: "Free", starter: "Starter", pro: "Pro", business: "Business", agency: "Business" }
const planName = (p?: string | null) => (p ? PLAN_NAMES[p.toLowerCase()] ?? p : null)

const DAY = 24 * 60 * 60 * 1000
const DISMISS_KEY = "creatabl_trial_banner_dismissed"

// Calcul depuis les données du compte : début de l'essai, date de fin, plan d'essai
// et plan choisi. Rien n'est fixé en dur.
export function computeTrial(trial: TrialInfo, now = new Date()) {
  const end = new Date(trial.endsAt)
  const start = trial.startedAt ? new Date(trial.startedAt) : new Date(end.getTime() - 14 * DAY)
  const msLeft = end.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / DAY)
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY))
  const elapsed = Math.min(totalDays, Math.max(0, totalDays - daysLeft))
  const endsToday = end.toDateString() === now.toDateString()
  const tomorrow = new Date(now.getTime() + DAY)
  const endsTomorrow = end.toDateString() === tomorrow.toDateString()
  return { end, daysLeft, totalDays, elapsed, endsToday, endsTomorrow, expired: msLeft <= 0 }
}

// Bannière d'essai du design system (TrialBanner). Même position et mêmes couleurs :
// lavande, puis ambre à 2 jours ou moins avec la conséquence concrète.
export function TrialBanner({ trial, now, demo = false }: { trial: TrialInfo | null; now?: Date; demo?: boolean }) {
  const [dismissedToday, setDismissedToday] = useState(!demo)

  useEffect(() => {
    if (demo) return
    try {
      setDismissedToday(localStorage.getItem(DISMISS_KEY) === new Date().toDateString())
    } catch {
      setDismissedToday(false)
    }
  }, [demo])

  if (!trial || dismissedToday) return null
  const t = computeTrial(trial, now)
  if (t.expired) return null

  const trialName = planName(trial.trialPlan) ?? "Business"
  const chosen = planName(trial.selectedPlan)
  const urgent = t.daysLeft <= 2
  const endLabel = t.end.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })

  const title = t.endsToday
    ? `Votre essai ${trialName} se termine aujourd'hui`
    : t.endsTomorrow
      ? `Votre essai ${trialName} se termine demain`
      : `Essai ${trialName} : il vous reste ${t.daysLeft} jours`

  const scheduled = trial.scheduledCount ?? 0
  const detail = urgent
    ? scheduled > 0
      ? `Choisissez un plan avant le ${endLabel} : sinon vos ${scheduled} post${scheduled > 1 ? "s" : ""} programmé${scheduled > 1 ? "s" : ""} seront suspendus.`
      : `Choisissez un plan avant le ${endLabel} pour garder l'accès à vos outils.`
    : `Toutes les fonctionnalités ${trialName} sont ouvertes jusqu'au ${endLabel}.${chosen ? ` Ensuite : plan ${chosen}, celui que vous avez choisi.` : ""}`

  return (
    <div className={demo ? undefined : "px-4 pt-4 md:px-6 lg:px-8"}>
      <div className={`cr-trial${urgent ? " cr-trial--urgent" : ""}`} role="status">
        <span className="cr-trial-ico">
          {urgent ? <Timer size={20} aria-hidden="true" /> : <Sparkles size={20} aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <strong>{title}</strong>
          <p>{detail}</p>
        </div>
        <div className="cr-trial-actions">
          <div
            className="cr-bar hidden sm:block"
            role="progressbar"
            aria-valuenow={t.elapsed}
            aria-valuemin={0}
            aria-valuemax={t.totalDays}
            aria-label="Jours d'essai écoulés"
          >
            <span style={{ width: `${Math.round((t.elapsed / t.totalDays) * 100)}%` }} />
          </div>
          <Link href="/dashboard/billing" className="cr-btn cr-btn--primary cr-btn--sm">
            {chosen ? `Confirmer ${chosen}` : "Choisir un plan"}
          </Link>
          <button
            type="button"
            className="cr-iconbtn"
            style={{ width: 32, height: 32 }}
            aria-label="Masquer jusqu'à demain"
            onClick={() => {
              try { localStorage.setItem(DISMISS_KEY, new Date().toDateString()) } catch {}
              setDismissedToday(true)
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
