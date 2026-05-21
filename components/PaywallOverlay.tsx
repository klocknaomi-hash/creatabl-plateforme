'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface PaywallOverlayProps {
  plan: string | null
}

const PLAN_DATA = {
  starter: {
    name: 'Starter',
    price: '49',
    annualPrice: '39',
    features: [
      '30 posts / mois',
      'Assistant IA de rédaction (limité)',
      'Calendrier éditorial',
      'Analytics essentiels',
      'LinkedIn, Instagram, Facebook, X'
    ]
  },
  pro: {
    name: 'Pro',
    price: '99',
    annualPrice: '79',
    features: [
      '120 posts / mois',
      'Assistant IA de rédaction (illimité)',
      'Suggestions d\'idées IA',
      'Analytics avancés',
      'Tout du Starter'
    ]
  },
  business: {
    name: 'Business',
    price: '199',
    annualPrice: '159',
    features: [
      '300 posts / mois (illimité)',
      'Tout le plan Pro',
      'Multi-comptes (jusqu\'à 5)',
      'Gestion équipe + rôles',
      'Agent IA avancé'
    ]
  }
}

export function PaywallOverlay({ plan }: PaywallOverlayProps) {
  const selectedPlanKey = (plan?.toLowerCase() as keyof typeof PLAN_DATA) || 'starter'
  const planData = PLAN_DATA[selectedPlanKey]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-white/60">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden"
      >
        <div className="p-8 text-center border-b border-gray-50 bg-gray-50/50">
          <div className="text-4xl mb-4">🎊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ton essai gratuit est terminé !
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Tu as exploré Creatabl pendant 7 jours. 
            C&apos;est maintenant le moment de continuer l&apos;aventure avec un abonnement. 
            Toutes tes données et tes posts sont bien conservés — rien n&apos;est perdu !
          </p>
        </div>

        <div className="p-8">
          <div className="bg-[#F8F7FF] rounded-2xl p-6 border border-[#EEEDFE] mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6366F1] bg-[#EEEDFE] px-2 py-1 rounded-md">
                  Plan recommandé
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{planData.name}</h3>
              </div>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">{planData.price}€</span>
                  <span className="text-gray-500 font-medium">/mois</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ou {planData.annualPrice}€/mois en annuel
                </p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {planData.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#6366F1]" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Link 
              href={`/api/stripe/create-checkout?plan=${selectedPlanKey}&billing=monthly`}
              className="w-full py-4 px-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
            >
              Activer le plan {planData.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="text-center">
            <Link 
              href="https://creatabl-ia.com/tarifs" 
              className="text-gray-500 hover:text-gray-900 text-sm font-medium flex items-center justify-center gap-1 group"
            >
              Voir tous les plans
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
