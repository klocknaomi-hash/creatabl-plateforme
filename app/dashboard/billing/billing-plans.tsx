"use client"

import { useState } from 'react'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface BillingPlansProps {
  currentPlan: string;
  selectedPlan: string;
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

export function BillingPlans({ currentPlan, selectedPlan }: BillingPlansProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const normalizedCurrent = currentPlan.toLowerCase()
  const normalizedSelected = selectedPlan.toLowerCase()

  return (
    <div className="space-y-10">
      {/* Toggle mensuel / annuel */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Mensuel
        </span>
        <button
          onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'yearly' ? 'bg-[#534AB7]' : 'bg-gray-200'
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
          const isSelected = plan.id === normalizedSelected
          const isPro = plan.id === 'pro'
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative bg-white rounded-3xl p-7 flex flex-col transition-all ${
                isPro
                  ? 'border-2 border-[#534AB7] shadow-lg shadow-purple-50'
                  : 'border border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#534AB7] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Le plus populaire
                </div>
              )}
              {isSelected && !isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#534AB7] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                  Ton choix
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 font-medium mb-4">{plan.tagline}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{displayPrice}€</span>
                  <span className="text-gray-400 text-sm">/mois</span>
                </div>
                {billing === 'yearly' ? (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    soit {plan.yearlyTotal}€ · Économise {plan.yearlySavings}€
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">
                    ou {plan.yearlyMonthly}€/mois en annuel
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-[#534AB7]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={`/api/stripe/create-checkout?plan=${plan.id}&billing=${billing}`}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#534AB7] text-white hover:bg-[#453da3] shadow-lg shadow-[#534AB7]/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Choisir ce plan
              </a>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
