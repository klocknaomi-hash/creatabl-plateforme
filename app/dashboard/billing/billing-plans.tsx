'use client'

import { Check, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface BillingPlansProps {
  currentPlan: string
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49',
    annualPrice: '39',
    features: ['5 posts par mois', 'IA Standard', '1 compte par réseau']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '99',
    annualPrice: '79',
    features: ['20 posts par mois', 'IA Avancée', '3 comptes par réseau'],
    recommended: true
  },
  {
    id: 'business',
    name: 'Business',
    price: '199',
    annualPrice: '159',
    features: ['Illimité', 'Équipe (3 pers.)', 'Support Prioritaire']
  }
]

export function BillingPlans({ currentPlan }: BillingPlansProps) {
  const handleActivate = () => {
    toast('🚀 Paiement en cours d\'activation', {
      description: 'Tu seras notifié(e) dès que c\'est prêt !',
      style: {
        background: '#EEEDFE',
        color: '#4F46E5',
        border: '1px border #E0DFFD'
      },
      duration: 3000
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PLANS.map((plan) => (
        <motion.div
          key={plan.id}
          whileHover={{ y: -5 }}
          className={`relative bg-white rounded-3xl p-8 border-2 transition-all flex flex-col ${
            plan.id === currentPlan.toLowerCase() 
              ? 'border-[#6366F1] shadow-xl shadow-indigo-50' 
              : 'border-gray-100 hover:border-gray-200 shadow-sm'
          }`}
        >
          {plan.id === currentPlan.toLowerCase() && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Ton plan actuel
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
              <span className="text-gray-500 font-medium">/mois</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              ou {plan.annualPrice}€/mois en annuel
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-[#6366F1]" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleActivate}
            className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              plan.id === currentPlan.toLowerCase()
                ? 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
            }`}
          >
            Activer ce plan
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      ))}
    </div>
  )
}
