"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface BillingPlansProps {
  currentPlan: string;
  selectedPlan: string;
}

const SOCIAL_ICONS = {
  li: { name: 'LinkedIn', color: '#0077B5', letter: 'in' },
  ig: { name: 'Instagram', color: '#E4405F', letter: 'ig' },
  fb: { name: 'Facebook', color: '#1877F2', letter: 'fb' },
  x: { name: 'X', color: '#000000', letter: 'x' },
  tt: { name: 'TikTok', color: '#000000', letter: 'tt' },
  yt: { name: 'YouTube', color: '#FF0000', letter: 'yt' },
  pt: { name: 'Pinterest', color: '#BD081C', letter: 'pt' },
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Pour les solopreneurs qui démarrent',
    monthlyPrice: 49,
    yearlyMonthly: 39,
    postsPerMonth: '30 posts / mois',
    socials: ['li', 'ig', 'fb', 'x'],
    features: [
      'Assistant IA de rédaction (limité)',
      'Calendrier éditorial',
      'Analytics essentiels',
      '1 espace de travail',
    ],
    buttonStyle: 'border-2 border-[#534AB7] text-[#534AB7] bg-white hover:bg-[#534AB7]/5',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les créateurs actifs qui veulent scaler',
    monthlyPrice: 99,
    yearlyMonthly: 79,
    postsPerMonth: '120 posts / mois',
    socials: ['li', 'ig', 'fb', 'x', 'tt'],
    features: [
      'Tout du Starter',
      'Assistant IA de rédaction (illimité)',
      'Suggestions d\'idées IA',
      'Reformuler un post',
      'Changer le ton (5 tons)',
      'Analytics avancés + graphiques',
      '3 espaces de travail',
    ],
    recommended: true,
    buttonStyle: 'bg-[#534AB7] text-white hover:bg-[#4339a0]',
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Pour les agences et équipes marketing',
    monthlyPrice: 199,
    yearlyMonthly: 159,
    postsPerMonth: 'Illimité',
    socials: ['li', 'ig', 'fb', 'x', 'tt', 'yt', 'pt'],
    features: [
      'Tout le plan Pro',
      'Multi-comptes (jusqu\'à 5)',
      'Gestion équipe + rôles',
      'Analytics tous comptes',
      'Support prioritaire',
      'Agent IA',
      '5 espaces de travail',
    ],
    buttonStyle: 'bg-gray-900 text-white hover:bg-black',
  },
]

export function BillingPlans({ currentPlan, selectedPlan }: BillingPlansProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const normalizedSelected = selectedPlan.toLowerCase()

  return (
    <div className="space-y-12">
      {/* Toggle mensuel / annuel */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              billing === 'monthly' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              billing === 'yearly' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annuel
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700`}>
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PLANS.map((plan) => {
          const isSelectedPlan = plan.id === normalizedSelected
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly
          const isPro = plan.id === 'pro'

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative bg-white rounded-2xl p-8 flex flex-col transition-all shadow-sm ${
                isPro ? 'border-2 border-[#534AB7]' : 'border border-gray-100'
              }`}
            >
              {/* Badges */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center w-full">
                {isPro && (
                  <div className="bg-[#534AB7] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md">
                    Le plus populaire
                  </div>
                )}
                {isSelectedPlan && (
                  <div className="bg-[#534AB7] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md">
                    TON CHOIX
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm italic text-[#534AB7] mt-1 font-serif">
                  {plan.tagline}
                </p>
                
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{displayPrice}€</span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
                
                <div className="h-5">
                  {billing === 'monthly' ? (
                    <p className="text-sm text-gray-400">
                      ou {plan.yearlyMonthly}€/mois en annuel
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      soit {plan.yearlyMonthly * 12}€ facturés par an
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                  par utilisateur et par mois
                </p>
              </div>

              <div className="h-px bg-gray-100 w-full mb-6" />

              <div className="space-y-8 flex-1">
                {/* Posts Section */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">
                    Génération de posts
                  </h4>
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Check className="w-4 h-4 text-[#534AB7] stroke-[3]" />
                    {plan.postsPerMonth}
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">
                    Fonctionnalités
                  </h4>
                  
                  {/* Social Icons */}
                  <div className="flex gap-2 mb-6">
                    {Object.entries(SOCIAL_ICONS).map(([key, data]) => {
                      const isActive = plan.socials.includes(key);
                      return (
                        <div 
                          key={key} 
                          title={data.name}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm ${
                            isActive ? '' : 'grayscale opacity-30'
                          }`}
                          style={{ backgroundColor: data.color }}
                        >
                          {data.letter}
                        </div>
                      );
                    })}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm font-medium">
                        <Check className="w-4 h-4 text-[#534AB7] stroke-[3] mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <a
                  href={`/api/stripe/create-checkout?plan=${plan.id}&billing=${billing}`}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center transition-all active:scale-[0.98] ${plan.buttonStyle}`}
                >
                  Choisir ce plan
                </a>
                <p className="text-[10px] text-center text-gray-400 font-medium">
                  Essai gratuit 7 jours · Sans carte bancaire
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
