'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '49',
    features: ['5 posts / mois', 'IA Standard', '1 compte par réseau', 'Scheduling de base'],
    color: 'indigo'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '99',
    features: ['20 posts / mois', 'IA Avancée (Tons, Reformuler)', '3 comptes par réseau', 'Analytics de base'],
    color: 'indigo',
    recommended: true
  },
  {
    id: 'business',
    name: 'Business',
    price: '199',
    features: ['Illimité', 'IA Illimitée', 'Comptes illimités', 'Équipe (3 pers.)', 'Support Prioritaire'],
    color: 'indigo'
  }
]

export function PlanSelection() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleStartTrial = async (planId: string) => {
    setLoading(planId)
    try {
      const res = await fetch(`/api/trial/start?plan=${planId}`, {
        method: 'POST',
      })
      
      if (res.ok) {
        toast.success('Essai gratuit activé !', {
          description: 'C\'est parti pour 7 jours d\'exploration.'
        })
        router.push('/dashboard')
      } else {
        toast.error('Une erreur est survenue.')
      }
    } catch (err) {
      toast.error('Erreur de connexion.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PLANS.map((plan) => (
        <motion.div
          key={plan.id}
          whileHover={{ y: -5 }}
          className={`relative bg-white rounded-3xl p-8 border-2 transition-all ${
            plan.recommended ? 'border-[#6366F1] shadow-xl shadow-indigo-100' : 'border-gray-100 hover:border-gray-200 shadow-sm'
          }`}
        >
          {plan.recommended && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recommandé
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
              <span className="text-gray-500 font-medium">/mois</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
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
            onClick={() => handleStartTrial(plan.id)}
            disabled={loading !== null}
            className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              plan.recommended
                ? 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-lg shadow-indigo-100'
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading === plan.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Commencer l&apos;essai
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      ))}
    </div>
  )
}
