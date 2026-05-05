'use client'

import { useState } from 'react'
import { Check, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface BillingPlansProps {
  currentPlan: string
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
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
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
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
    recommended: true,
  },
  {
    id: 'business',
    name: 'Business',
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
    recommended: false,
  },
]

export function BillingPlans({ currentPlan }: BillingPlansProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Mensuel
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billing === 'yearly' ? 'bg-[#7F77DD]' : 'bg-gray-200'
          }`}
          aria-label="Basculer entre mensuel et annuel"
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              billing === 'yearly' ? 'translate-x-6' : 'translate-x-0'
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly
          const isCurrentPlan = plan.id === currentPlan.toLowerCase()

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all flex flex-col ${
                plan.recommended
                  ? 'border-[#7F77DD] shadow-xl shadow-purple-100'
                  : isCurrentPlan
                  ? 'border-[#7F77DD] shadow-xl shadow-purple-50'
                  : 'border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              {/* "Ton plan actuel" badge */}
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7F77DD] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Ton plan actuel
                </div>
              )}

              {/* "Le plus populaire" badge for Pro (only shown when not current plan) */}
              {plan.recommended && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7F77DD] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Le plus populaire
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{displayPrice}€</span>
                  <span className="text-gray-500 font-medium">/mois</span>
                </div>
                {billing === 'yearly' ? (
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    soit {plan.yearlyTotal}€ facturés en une fois · Économisez {plan.yearlySavings}€
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Passez à l&apos;annuel et économisez {plan.yearlySavings}€/an
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-[#7F77DD]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={`/api/stripe/create-checkout?plan=${plan.id}&billing=${billing}`}
                className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isCurrentPlan
                    ? 'bg-[#7F77DD] text-white hover:bg-[#6C64C5]'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {isCurrentPlan ? 'Ton plan actuel' : 'Activer ce plan'}
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
