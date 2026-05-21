"use client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function TrialBanner() {
  const { user } = useUser()
  const router = useRouter()
  
  const onboardingStep = user?.publicMetadata?.onboardingStep as string
  if (onboardingStep !== "done") return null

  let trialEndsAt = user?.publicMetadata?.trialEndsAt as string | undefined
  
  // Fallback to 7 days from creation if trialEndsAt is missing
  if (!trialEndsAt && user?.createdAt) {
    const createdAt = new Date(user.createdAt)
    const sevenDaysLater = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    trialEndsAt = sevenDaysLater.toISOString()
  }

  if (!trialEndsAt) return null
  
  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysLeft <= 0 || isNaN(daysLeft)) return null
  
  return (
    <div className="w-full bg-primary text-white px-6 py-3 flex items-center justify-between text-sm">
      <span>
        Tu bénéficies de toutes les fonctionnalités Business gratuitement 
        encore <strong>{daysLeft} jour{daysLeft > 1 ? "s" : ""}</strong>. 
        Choisis ton plan avant la fin de l'essai.
      </span>
      <button
        onClick={() => window.location.href = "https://creatabl-ia.com/tarifs"}
        className="ml-4 bg-white text-primary font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors whitespace-nowrap"
      >
        Mettre à niveau
      </button>
    </div>
  )
}
