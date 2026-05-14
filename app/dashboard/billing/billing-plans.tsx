"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface BillingPlansProps {
  currentPlan: string;
  selectedPlan: string;
}

const SOCIAL_ICONS = {
  li: (
    <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  ig: (
    <svg className="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.735.079-2.92.353-3.956 1.389-1.036 1.036-1.31 2.221-1.389 3.956-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.079 1.735.353 2.92 1.389 3.956 1.036 1.036 2.221 1.31 3.956 1.389 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.735-.079 2.92-.353 3.956-1.389 1.036-1.036 1.31-2.221 1.389-3.956.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.079-1.735-.353-2.92-1.389-3.956-1.036-1.036-2.221-1.31-3.956-1.389-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  fb: (
    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tt: (
    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-3.33 2.76-6.13 6.13-6.49 1.17-.12 2.35.06 3.44.53V9.07c-1.38-.45-2.88-.51-4.27-.12-1.52.41-2.81 1.47-3.51 2.87-.51.98-.71 2.09-.64 3.19.12 2.1 1.57 4 3.52 4.79 1.17.49 2.5.56 3.72.19 1.75-.52 3.19-1.92 3.73-3.63.15-.46.22-.93.24-1.41.04-3.58.02-7.16.03-10.74z" />
    </svg>
  ),
  yt: (
    <svg className="w-5 h-5 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  pt: (
    <svg className="w-5 h-5 text-[#BD081C]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.259 7.929-7.259 4.164 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 12.017 0z" />
    </svg>
  ),
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
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              billing === 'monthly' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const isSelectedPlan = plan.id === normalizedSelected
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthly
          const isPro = plan.id === 'pro'

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative bg-white rounded-2xl p-6 flex flex-col transition-all shadow-sm ${
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
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm italic text-[#534AB7] mt-1 font-serif">
                  {plan.tagline}
                </p>
                
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{displayPrice}€</span>
                  <span className="text-gray-500 text-sm font-normal">/mois</span>
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
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  par utilisateur et par mois
                </p>
              </div>

              <div className="h-px bg-gray-100 w-full mb-6" />

              <div className="space-y-8 flex-1">
                {/* Posts Section */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Génération de posts
                  </h4>
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Check className="w-4 h-4 text-green-500 stroke-[3]" />
                    {plan.postsPerMonth}
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Fonctionnalités
                  </h4>
                  
                  {/* Social Icons */}
                  <div className="flex gap-2 mb-6">
                    {Object.entries(SOCIAL_ICONS).map(([key, icon]) => {
                      const isActive = plan.socials.includes(key);
                      return (
                        <div 
                          key={key} 
                          className={isActive ? '' : 'grayscale opacity-30'}
                        >
                          {icon}
                        </div>
                      );
                    })}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 text-sm font-medium">
                        <Check className="w-4 h-4 text-green-500 stroke-[3] mt-0.5 flex-shrink-0" />
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
                <p className="text-xs text-center text-gray-400 font-medium">
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
