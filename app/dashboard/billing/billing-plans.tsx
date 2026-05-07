'use client'

import { useState } from 'react'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface BillingPlansProps {
  currentPlan: string
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Pour les solopreneurs qui démarrent',
    monthlyPrice: 49,
    yearlyMonthly: 39,
    yearlyTotal: 468,
    yearlySavings: 120,
    features: [
      'LinkedIn · Instagram · X · Facebook',
      '30 posts/mois',
      '30 générations IA/mois',
      'Calendrier éditorial',
      'Analytics essentiels',
      '1 espace de travail',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les créateurs actifs qui veulent scaler',
    monthlyPrice: 99,
    yearlyMonthly: 79,
    yearlyTotal: 948,
    yearlySavings: 240,
    features: [
      'Tout le Starter inclus',
      '120 posts/mois',
      '120 générations IA/mois',
      'Reformuler un post',
      'Changer le ton (5 tons)',
      'Analytics avancés + graphiques',
      '3 espaces de travail',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pour les agences et équipes marketing',
    monthlyPrice: 199,
    yearlyMonthly: 159,
    yearlyTotal: 1908,
    yearlySavings: 480,
    features: [
      'Tout le Pro inclus',
      '500 posts/mois',
      '500 générations IA/mois',
      'Multi-comptes jusqu\'à 5',
      'Gestion équipe + rôles',
      'Analytics tous comptes',
      'Support prioritaire',
      '5 espaces de travail',
    ],
  },
]

// Cadran de découverte contextuel selon le plan actuel
const UPGRADE_TEASER: Record<string, {
  title: string
  tagline: string
  highlights: string[]
  monthlyPrice: number
  yearlyMonthly: number
  bg: string
  borderColor: string
  btnBg: string
  btnHover: string
}> = {
  starter: {
    title: 'Passe au Pro 🚀',
    tagline: 'Débloques plus de contenu, plus d\'IA, plus d\'espaces.',
    highlights: [
      '120 posts/mois (×4)',
      'Reformuler un post & Changer le ton',
      'Analytics avancés + graphiques',
      '3 espaces de travail',
    ],
    monthlyPrice: 99,
    yearlyMonthly: 79,
    bg: '#F5F4FF',
    borderColor: '#7F77DD',
    btnBg: '#7F77DD',
    btnHover: '#6C64C5',
  },
  pro: {
    title: 'Passe au Business 🏢',
    tagline: 'Pour gérer plusieurs clients et piloter une équipe.',
    highlights: [
      '500 posts/mois (×4)',
      'Multi-comptes jusqu\'à 5',
      'Gestion équipe + rôles',
      'Support prioritaire',
    ],
    monthlyPrice: 199,
    yearlyMonthly: 159,
    bg: '#F0FDF4',
    borderColor: '#10B981',
    btnBg: '#10B981',
    btnHover: '#059669',
  },
}

const PRICING_PAGE = 'https://creatabl-ia.com/#pricing'

export function BillingPlans({ currentPlan }: BillingPlansProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const normalizedPlan = currentPlan.toLowerCase()
  const teaser = UPGRADE_TEASER[normalizedPlan]

  return (
    <div className="space-y-10">
      {/* Toggle mensuel / annuel */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Mensuel
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'yearly' ? 'bg-[#7F77DD]' : 'bg-gray-200'
            }`}
          aria-label="Basculer entre mensuel et annuel"
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${billing === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
          />
        </button>
        <span className={`text-sm font-medium ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Annuel
          <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
            −20%
          </span>
        </span>
      </div>

      {/* Grille des 3 plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === normalizedPlan
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly

          return (
            <motion.div
              key={plan.id}
              whileHover={isCurrentPlan ? {} : { y: -4 }}
              className={`relative bg-white rounded-3xl p-7 border-2 flex flex-col transition-all ${isCurrentPlan
                ? 'border-[#7F77DD] shadow-lg shadow-purple-50'
                : 'border-gray-100 hover:border-gray-200 shadow-sm opacity-70 hover:opacity-90'
                }`}
            >
              {/* Badge plan actuel — seul indicateur, pas de bouton */}
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7F77DD] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Ton plan actuel
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-0.5">{plan.name}</h3>
                <p className="text-xs text-[#7F77DD] font-medium mb-3">{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{displayPrice}€</span>
                  <span className="text-gray-400 text-sm">/mois</span>
                </div>
                {billing === 'yearly' ? (
                  <p className="text-xs text-gray-400 mt-1">
                    soit {plan.yearlyTotal}€ · Économisez {plan.yearlySavings}€
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    ou {plan.yearlyMonthly}€/mois en annuel
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[#EEEDFE] flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 text-[#7F77DD]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Bouton : disparaît si plan actuel */}
              {!isCurrentPlan && (
                <a
                  href={PRICING_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Voir les détails
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Cadran de découverte contextuel — visible uniquement si upgrade possible */}
      {teaser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 border-2 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ backgroundColor: teaser.bg, borderColor: teaser.borderColor }}
        >
          <div className="space-y-3 flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900">{teaser.title}</h3>
            <p className="text-sm text-gray-500">{teaser.tagline}</p>
            <ul className="space-y-1.5">
              {teaser.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 justify-center md:justify-start">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: teaser.borderColor }} />
                  {h}
                </li>
              ))}
            </ul>
            <p className="text-base font-bold text-gray-900 pt-1">
              {billing === 'monthly' ? teaser.monthlyPrice : teaser.yearlyMonthly}€/mois
              <span className="text-sm font-normal text-gray-500 ml-2">
                {billing === 'monthly'
                  ? `ou ${teaser.yearlyMonthly}€/mois en annuel`
                  : '· facturé annuellement'
                }
              </span>
            </p>
          </div>

          <a
            href={PRICING_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-white rounded-full px-8 py-4 text-base font-bold flex items-center gap-2 transition-colors"
            style={{ backgroundColor: teaser.btnBg }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = teaser.btnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = teaser.btnBg)}
          >
            Voir l&apos;offre complète
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      )}
    </div>
  )
}
