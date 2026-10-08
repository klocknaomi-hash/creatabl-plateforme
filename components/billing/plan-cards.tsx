'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import NetworkLogo, { type NetworkName } from '@/components/ds/NetworkLogo'

interface PlanCardsProps {
  currentPlan?: string
  selectedPlan?: string
  /** « expired » : écran de fin d'essai (pas de nouvel essai annoncé, retour au tableau de bord après Free). */
  variant?: 'billing' | 'expired'
}

const NETWORKS: { id: NetworkName; label: string }[] = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'x', label: 'X' },
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Pour découvrir Creatabl sans engagement',
    monthlyPrice: 0,
    yearlyMonthly: 0,
    subtext: 'Pour toujours',
    credits: '20 crédits / mois',
    socials: ['linkedin', 'instagram'],
    features: ['Assistant IA de rédaction (basique)', 'Calendrier éditorial'],
    recommended: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Pour les solopreneurs qui démarrent',
    monthlyPrice: 49,
    yearlyMonthly: 39,
    subtext: 'Par utilisateur et par mois',
    credits: '50 crédits / mois',
    socials: ['linkedin', 'instagram', 'facebook', 'x'],
    features: ['Assistant IA de rédaction (limité)', 'Calendrier éditorial', 'Analytics essentiels'],
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les créateurs actifs qui veulent grandir',
    monthlyPrice: 99,
    yearlyMonthly: 79,
    subtext: 'Par utilisateur et par mois',
    credits: '120 crédits / mois',
    socials: ['linkedin', 'instagram', 'facebook', 'x'],
    features: ['Tout le plan Starter', 'Assistant IA de rédaction (illimité)', "Suggestions d'idées IA", 'Analytics avancés'],
    recommended: true,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pour les agences et équipes marketing',
    monthlyPrice: 199,
    yearlyMonthly: 159,
    subtext: 'Par utilisateur et par mois',
    credits: '300 crédits / mois',
    socials: ['linkedin', 'instagram', 'facebook', 'x'],
    features: ['Tout le plan Pro', "Multi-comptes (jusqu'à 5)", 'Gestion équipe + rôles', 'Agent IA (Tendances)'],
    recommended: false,
  },
]

// Cartes de plans du design system (PricingCard) : fond blanc, bordure, plan
// recommandé en violet, bouton primaire ou secondaire.
export function PlanCards({ currentPlan = 'starter', variant = 'billing' }: PlanCardsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const normalizedCurrent = variant === 'expired' ? '' : currentPlan.toLowerCase()

  const handleSelectPlan = async (planId: string) => {
    if (planId === normalizedCurrent) return
    setLoading(planId)

    if (planId === 'free') {
      try {
        const res = await fetch('/api/user/init-free', { method: 'POST' })
        if (!res.ok) throw new Error('init-free')
        if (variant === 'expired') window.location.href = '/dashboard'
        else window.location.reload()
      } catch {
        window.location.href = '/api/stripe/downgrade-free'
      }
      return
    }

    window.location.href = `/api/stripe/create-checkout?plan=${planId}&billing=${billing}`
  }

  const ctaLabel = (plan: (typeof PLANS)[number]) => {
    if (plan.id === 'free') return 'Continuer avec Free'
    if (variant === 'expired') return `Choisir ${plan.name}`
    return `Essayer ${plan.name} · 14 jours gratuits`
  }

  return (
    <div className="w-full space-y-10">
      <div className="flex justify-center">
        <div className="cr-segment" role="tablist" aria-label="Facturation">
          <button type="button" role="tab" className="cr-tab" aria-selected={billing === 'monthly'} onClick={() => setBilling('monthly')}>
            Mensuel
          </button>
          <button type="button" role="tab" className="cr-tab" aria-selected={billing === 'yearly'} onClick={() => setBilling('yearly')}>
            Annuel
            <span className="cr-badge cr-badge--success cr-badge--plain">-20 %</span>
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === normalizedCurrent
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly

          return (
            <article
              key={plan.id}
              className={`relative flex h-full flex-col rounded-[12px] bg-white p-8 ${
                plan.recommended ? 'border-2 border-[#7225E3] shadow-[0_12px_32px_rgba(20,18,31,0.10)]' : 'border border-[#E8E6F0]'
              }`}
            >
              {plan.recommended && (
                <span className="cr-badge cr-badge--violet absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7225E3] text-white">
                  Le plus populaire
                </span>
              )}

              <div className="mb-8">
                <h3 className="font-heading text-2xl font-semibold text-[#14121F]">{plan.name}</h3>
                <p className="mb-6 mt-1 text-sm text-[#4B4B63]">{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-semibold tracking-[-0.01em] text-[#14121F]">{price} €</span>
                  <span className="text-sm text-[#6B6780]">/mois</span>
                </div>
                {billing === 'yearly' && plan.id !== 'free' && (
                  <p className="mt-1 text-xs text-[#4B4B63]">soit {plan.yearlyMonthly * 12} € par an</p>
                )}
                <p className="mt-1 text-xs text-[#6B6780]">{plan.subtext}</p>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h4 className="mb-3 text-xs font-semibold text-[#6B6780]">Publication</h4>
                  <p className="flex items-center gap-2 text-sm font-medium text-[#14121F]">
                    <Check className="size-4 shrink-0 text-[#0E7445]" aria-hidden="true" />
                    {plan.credits}
                  </p>
                </div>
                <div>
                  <h4 className="mb-3 text-xs font-semibold text-[#6B6780]">Réseaux et fonctionnalités</h4>
                  <div className="mb-4 flex gap-2">
                    {NETWORKS.map((n) => {
                      const on = plan.socials.includes(n.id)
                      return (
                        <span key={n.id} className="cr-net-dot" style={on ? undefined : { opacity: 0.35, filter: 'grayscale(1)' }} title={on ? n.label : `${n.label} non inclus`}>
                          <NetworkLogo name={n.id} size={14} />
                        </span>
                      )
                    })}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#14121F]">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#0E7445]" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-8 text-center">
                <button
                  type="button"
                  disabled={isCurrent || loading !== null}
                  aria-busy={loading === plan.id || undefined}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`cr-btn w-full ${plan.recommended || plan.id === 'business' ? 'cr-btn--primary' : 'cr-btn--secondary'}`}
                >
                  {loading === plan.id && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {isCurrent ? 'Plan actuel' : ctaLabel(plan)}
                </button>
                <p className="text-xs text-[#6B6780]">
                  {plan.id === 'free' || billing === 'monthly' ? 'Sans engagement' : 'Engagement 12 mois'}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
