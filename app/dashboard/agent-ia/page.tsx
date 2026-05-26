'use client'

import { useUser } from '@clerk/nextjs'
import { Bot, Sparkles, TrendingUp, BrainCircuit, Wand2, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const UPCOMING_FEATURES = [
  {
    icon: TrendingUp,
    title: 'Tendances détectées',
    description: 'Détectez automatiquement les sujets trending sur Google Trends, LinkedIn, Instagram et TikTok.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: BrainCircuit,
    title: 'Génération de contenu IA',
    description: 'Générez en un clic des idées de posts engageants adaptés à votre niche et vos plateformes.',
    color: 'text-[#534AB7]',
    bg: 'bg-[#EEEDFE]',
  },
  {
    icon: Wand2,
    title: 'Réécriture & optimisation',
    description: 'Reformulez, améliorez le ton et optimisez vos contenus existants avec l\'IA Gemini.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]

export default function AgentIAPage() {
  const { user } = useUser()
  const firstName = user?.firstName || 'toi'

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 space-y-12 max-w-3xl mx-auto">

      {/* Header */}
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className="mx-auto size-20 rounded-3xl bg-gradient-to-br from-[#534AB7] to-purple-400 flex items-center justify-center shadow-lg shadow-purple-200">
          <Bot className="size-10 text-white" />
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-gradient-to-r from-[#534AB7] to-purple-600 text-white border-none rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">
            Business
          </Badge>
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">
            Bientôt disponible
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Agent IA ✦
        </h1>
        <p className="text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
          Bonjour {firstName} 👋 — Votre agent IA personnel est en cours de développement. 
          Il sera bientôt disponible pour vous aider à créer du contenu qui performe.
        </p>
      </div>

      {/* Coming soon features */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        {UPCOMING_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden"
          >
            {/* Lock overlay */}
            <div className="absolute top-3 right-3">
              <Lock className="size-3.5 text-gray-300" />
            </div>

            <div className={`size-10 rounded-xl ${feature.bg} flex items-center justify-center`}>
              <feature.icon className={`size-5 ${feature.color}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{feature.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-3">
        <p className="text-xs text-gray-400 font-medium">
          <Sparkles className="size-3.5 inline mr-1 text-amber-400" />
          Nous travaillons dur pour vous offrir la meilleure expérience IA possible.
        </p>
        <Button
          variant="outline"
          className="rounded-xl text-sm font-semibold px-6 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-default"
          onClick={() => {}}
        >
          Recevoir une notification à la sortie
        </Button>
      </div>
    </div>
  )
}
