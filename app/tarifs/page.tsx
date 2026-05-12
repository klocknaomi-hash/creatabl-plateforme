'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowRight, Loader2, Zap, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { PublicNavbar } from '@/components/marketing/navbar'

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
    recommended: false,
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
    recommended: true,
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
    recommended: false,
  },
]

export default function TarifsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()

  const handleChoosePlan = (planId: string) => {
    setLoading(planId)
    // Save selection to localStorage
    localStorage.setItem('selectedPlan', planId)
    localStorage.setItem('selectedBilling', billing)
    
    // Redirect to sign-up
    router.push('/sign-up')
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-4">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto pt-20">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Boostez votre présence sociale
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Choisissez le plan qui vous convient. 7 jours d&apos;essai gratuit sur tous les plans.
          </p>
        </div>

        {/* Toggle mensuel / annuel */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              billing === 'yearly' ? 'bg-indigo-500' : 'bg-zinc-800'
            }`}
            aria-label="Basculer entre mensuel et annuel"
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                billing === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billing === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
            Annuel
            <span className="ml-1.5 text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full font-semibold">
              −20%
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`relative bg-zinc-900 rounded-[2.5rem] p-10 border-2 transition-all flex flex-col ${
                  plan.recommended
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105 z-10'
                    : 'border-white/5 hover:border-white/10 shadow-sm'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-6 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap flex items-center gap-1 shadow-lg shadow-indigo-500/20">
                    <Zap className="w-3 h-3 fill-white" />
                    Le plus populaire
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6 font-medium">{plan.tagline}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">{displayPrice}€</span>
                    <span className="text-zinc-500 font-bold">/mois</span>
                  </div>
                  {billing === 'yearly' ? (
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      soit {plan.yearlyTotal}€ facturés annuellement
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      Économisez {plan.yearlySavings}€ en passant à l&apos;annuel
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm font-medium">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`https://app.creatabl-ia.com/sign-up?plan=${plan.id}`}
                  className={`w-full py-5 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    plan.recommended
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 active:scale-95'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95'
                  }`}
                >
                  Choisir ce plan
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="mt-20 text-center space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-zinc-500 font-medium">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Paiement 100% sécurisé
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              7 jours d&apos;essai gratuit
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Sans engagement
            </div>
          </div>
          
          <p className="text-sm text-zinc-600 max-w-xl mx-auto">
            Des questions ? Contactez notre support 24/7. Toutes les transactions sont chiffrées et sécurisées via Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
