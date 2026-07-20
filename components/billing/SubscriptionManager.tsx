'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SubscriptionManagerProps {
  plan: string
  subscriptionStatus?: string | null
  cancelAtPeriodEnd?: boolean | null
  cancelsAt?: Date | string | null
  hasStripeSubscription: boolean
}

export function SubscriptionManager({
  plan,
  subscriptionStatus,
  cancelAtPeriodEnd,
  cancelsAt,
  hasStripeSubscription,
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false)

  if (!hasStripeSubscription || plan === 'free') {
    return null
  }

  const isCanceling = cancelAtPeriodEnd || subscriptionStatus === 'canceling'

  const formattedDate = cancelsAt
    ? new Date(cancelsAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const handleCancel = async () => {
    const confirmCancel = window.confirm(
      "Êtes-vous sûr de vouloir résilier votre abonnement ? Vous conserverez l'accès jusqu'à la fin de votre période en cours."
    )
    if (!confirmCancel) return

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        window.location.reload()
      } else {
        alert(data.error || 'Erreur lors de la résiliation')
        setLoading(false)
      }
    } catch (err) {
      console.error('Cancel subscription error:', err)
      setLoading(false)
    }
  }

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
    } catch (err) {
      console.error('Reactivate subscription error:', err)
      setLoading(false)
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              Abonnement actuel : {plan.toUpperCase()}
            </span>
            {isCanceling ? (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Se termine prochainement
              </span>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Actif
              </span>
            )}
          </div>

          {isCanceling ? (
            <p className="text-sm text-gray-600 leading-relaxed pt-1">
              Votre abonnement <strong className="text-gray-900">{plan.toUpperCase()}</strong> se termine le{' '}
              <strong className="text-gray-900">{formattedDate || 'la fin de la période'}</strong>. Vous continuerez à utiliser Creatabl jusqu'à cette date.
            </p>
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed pt-1">
              Vous avez un abonnement actif. Vous pouvez le résilier à tout moment. Vous continuerez à utiliser Creatabl jusqu'à la fin de votre période de facturation.
            </p>
          )}
        </div>

        <div>
          {isCanceling ? (
            <Button
              onClick={handleReactivate}
              disabled={loading}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Réactivation...
                </>
              ) : (
                'Réactiver mon abonnement'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Résiliation...
                </>
              ) : (
                'Résilier mon abonnement'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
