'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface PaywallBannerProps {
  selectedPlan?: string
}

export function PaywallBanner({ selectedPlan }: PaywallBannerProps) {
  const router = useRouter()
  
  const planName = selectedPlan 
    ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
    : 'Pro'

  return (
    <div className="w-full bg-gradient-to-r from-[#534AB7] to-[#7B73D4] 
      text-white px-6 py-4 flex items-center justify-between">
      <div>
        <p className="font-bold text-sm">
          Ton essai gratuit est terminé
        </p>
        <p className="text-xs text-white/80 mt-0.5">
          Choisis ton forfait pour continuer à utiliser Creatabl.
          {selectedPlan && ` Tu avais sélectionné le plan ${planName}.`}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="bg-white text-[#534AB7] font-bold px-5 py-2 
            rounded-xl text-sm hover:bg-gray-100 transition-colors 
            whitespace-nowrap"
        >
          Choisir mon forfait
        </button>
      </div>
    </div>
  )
}
