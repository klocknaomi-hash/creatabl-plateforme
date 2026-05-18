'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

function SignUpContent() {
  const params = useSearchParams()
  
  useEffect(() => {
    const plan = params.get('plan')
    if (plan) {
      localStorage.setItem('selectedPlan', plan)
    }
  }, [params])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignUp 
        appearance={{ variables: { colorPrimary: '#534AB7' } }}
        fallbackRedirectUrl="/dashboard"
        routing="path"
        path="/sign-up"
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">Chargement...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
