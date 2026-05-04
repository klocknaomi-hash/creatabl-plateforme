'use client'

import Link from 'next/link'
import { AlertTriangle, PartyPopper, ArrowRight } from 'lucide-react'

interface TrialBannerProps {
  daysLeft: number | null
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  if (daysLeft === null) return null

  const isUrgent = daysLeft <= 3

  return (
    <div 
      className={`w-full py-2 px-4 flex items-center justify-center gap-4 transition-all duration-300 ${
        isUrgent 
          ? 'bg-[#FAEEDA] text-[#854D0E] border-b border-[#F6E0B3]' 
          : 'bg-[#EEEDFE] text-[#4F46E5] border-b border-[#E0DFFD]'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-[#D97706]" />
        ) : (
          <PartyPopper className="w-4 h-4 text-[#6366F1]" />
        )}
        <span>
          {isUrgent 
            ? `⚠️ Plus que ${daysLeft} jour${daysLeft > 1 ? 's' : ''} d'essai gratuit !` 
            : `🎉 Essai gratuit — il te reste ${daysLeft} jours`}
        </span>
      </div>
      
      <Link 
        href="/dashboard/billing"
        className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 transition-all ${
          isUrgent
            ? 'bg-[#854D0E] text-white hover:bg-[#71420C]'
            : 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
        }`}
      >
        {isUrgent ? 'Activer maintenant' : 'Activer mon abonnement'}
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
