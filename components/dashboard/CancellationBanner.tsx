'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface CancellationBannerProps {
  cancelsAt?: string | Date | null
}

export function CancellationBanner({ cancelsAt: initialCancelsAt }: CancellationBannerProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const isCanceling = user?.publicMetadata?.cancelAtPeriodEnd as boolean | undefined
  const rawCancelsAt = (user?.publicMetadata?.cancelsAt as string | undefined) || initialCancelsAt

  if (!isCanceling) return null

  const formattedDate = rawCancelsAt
    ? new Date(rawCancelsAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'la fin de votre période en cours'

  const handleReactivate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/reactivate-subscription', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || 'Erreur lors de la réactivation')
        setLoading(false)
      }
    } catch (e) {
      console.error('Reactivate error:', e)
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm shrink-0">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          Votre abonnement se termine le <strong>{formattedDate}</strong>. Vous conservez l'accès jusqu'à cette date.
        </span>
      </div>
      <button
        onClick={handleReactivate}
        disabled={loading}
        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 flex items-center gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Réactivation...
          </>
        ) : (
          'Réactiver mon abonnement'
        )}
      </button>
    </div>
  )
}
