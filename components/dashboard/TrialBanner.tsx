"use client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import { isNaomiOrTest } from "@/lib/plans"

export function TrialBanner() {
  const { user } = useUser()
  const router = useRouter()
  
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (isNaomiOrTest(email)) return null

  const currentPlan = (user?.publicMetadata?.plan as string) || (user?.publicMetadata?.selectedPlan as string) || 'starter'
  if (currentPlan === 'free' || user?.publicMetadata?.plan === 'free') return null

  const onboardingStep = user?.publicMetadata?.onboardingStep as string
  if (onboardingStep !== "done") return null

  let trialEndsAt = user?.publicMetadata?.trialEndsAt as string | undefined
  
  // Baseline: 14 days from creation if trialEndsAt is missing
  if (!trialEndsAt && user?.createdAt) {
    const createdAt = new Date(user.createdAt)
    const fourteenDaysLater = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)
    trialEndsAt = fourteenDaysLater.toISOString()
  }

  if (!trialEndsAt) return null
  
  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysLeft <= 0 || isNaN(daysLeft)) return null
  
  const trialPlanName = ((user?.publicMetadata?.trialPlan as string) || currentPlan || 'Business').toUpperCase()

  return (
    <div className="w-full bg-primary text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm shrink-0">
      <span className="text-[13px] leading-snug">
        Essai <strong>{trialPlanName}</strong> — <strong>{daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}</strong>.
        Choisis ton plan avant la fin de l'essai.
      </span>
      <button
        onClick={() => router.push('/dashboard/billing')}
        className="bg-white text-primary font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
      >
        Mettre à niveau
      </button>
    </div>
  )
}
