'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handlePostSignUp() {
      try {
        const plan =
          localStorage.getItem('selected_plan') ||
          localStorage.getItem('selectedPlan') ||
          'free'

        if (plan === 'free') {
          const res = await fetch('/api/user/init-free', {
            method: 'POST',
          })
          if (!res.ok) {
            console.error('Failed to init free plan:', await res.text())
          }
          router.push('/onboarding')
        } else {
          const billing =
            localStorage.getItem('selected_billing') ||
            localStorage.getItem('selectedBilling') ||
            'monthly'
          router.push(
            `/api/stripe/create-checkout?plan=${plan}&billing=${billing}`
          )
        }
      } catch (err: any) {
        console.error('Error handling post sign-up redirect:', err)
        setError('Erreur lors de la redirection. Accès au tableau de bord...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    }

    handlePostSignUp()
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 bg-[#534AB7]/10 border border-[#534AB7]/30 rounded-2xl flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 animate-spin text-[#534AB7]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Finalisation de votre compte...</h1>
          <p className="text-zinc-400 text-sm">
            {error || 'Vous allez être redirigé automatiquement dans un instant.'}
          </p>
        </div>
      </div>
    </div>
  )
}
