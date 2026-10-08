"use client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Sparkles as SparklesIcon, Timer as TimerIcon } from "lucide-react"

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

  const bannerText = daysLeft <= 3
    ? `Votre essai gratuit se termine dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}, choisissez votre plan.`
    : `Essai ${trialPlanName} — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}. Choisis ton plan avant la fin de l'essai.`

  const urgent = daysLeft <= 3

  return (
    <div
      role="status"
      className={`w-full px-4 py-2.5 md:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-sm shrink-0 border-b ${
        urgent ? "bg-[#FDF2DF] border-[#F4DDB3] text-[#14121F]" : "bg-[#F3EEFD] border-[#E7DCFC] text-[#14121F]"
      }`}
    >
      <span className="flex items-center gap-2 text-[14px] leading-snug">
        {urgent ? (
          <TimerIcon className="size-[18px] shrink-0 text-[#8A4B00]" aria-hidden="true" />
        ) : (
          <SparklesIcon className="size-[18px] shrink-0 text-[#7225E3]" aria-hidden="true" />
        )}
        <strong className="font-semibold">{bannerText}</strong>
      </span>
      <button
        onClick={() => router.push('/pricing')}
        className="rounded-full bg-[#7225E3] px-4 h-9 text-sm font-semibold text-white hover:bg-[#5B1BB8] transition-colors whitespace-nowrap shrink-0"
      >
        Mettre à niveau
      </button>
    </div>
  )
}
