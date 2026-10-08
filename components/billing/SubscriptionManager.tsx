'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ds/confirm'

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

  const confirmDialog = useConfirm()

  const handleCancel = async () => {
    const confirmCancel = await confirmDialog({
      title: "Résilier votre abonnement ?",
      description: "Vous conserverez l'accès jusqu'à la fin de votre période en cours.",
      confirmLabel: "Résilier",
      cancelLabel: "Garder mon abonnement",
    })
    if (!confirmCancel) return

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        window.location.reload()
      } else {
        toast.error(data.error || 'Erreur lors de la résiliation')
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
        toast.error(data.error || 'Erreur lors de la réactivation')
        setLoading(false)
      }
    } catch (err) {
      console.error('Reactivate subscription error:', err)
      setLoading(false)
    }
  }

  return (
    <Card className="border border-[#E8E6F0] shadow-sm rounded-2xl bg-white overflow-hidden">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E7DCFC] text-[#5B1BB8]">
              Abonnement actuel : {plan.toUpperCase()}
            </span>
            {isCanceling ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FDF2DF] text-[#8A4B00] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Se termine prochainement
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E7F6EE] text-[#0E7445] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Actif
              </span>
            )}
          </div>

          {isCanceling ? (
            <p className="text-sm text-[#4B4B63] leading-relaxed pt-1">
              Votre abonnement <strong className="text-[#14121F]">{plan.toUpperCase()}</strong> se termine le{' '}
              <strong className="text-[#14121F]">{formattedDate || 'la fin de la période'}</strong>. Vous continuerez à utiliser Creatabl jusqu'à cette date.
            </p>
          ) : (
            <p className="text-sm text-[#4B4B63] leading-relaxed pt-1">
              Vous avez un abonnement actif. Vous pouvez le résilier à tout moment. Vous continuerez à utiliser Creatabl jusqu'à la fin de votre période de facturation.
            </p>
          )}
        </div>

        <div>
          {isCanceling ? (
            <Button
              onClick={handleReactivate}
              disabled={loading}
              className="bg-[#8A38F5] hover:bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all"
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
              className="border-[#FDECEA] text-[#B42318] hover:bg-[#FDECEA] hover:text-[#96190F] font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
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
