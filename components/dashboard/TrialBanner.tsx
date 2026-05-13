"use client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function TrialBanner() {
  const { user } = useUser()
  const router = useRouter()
  
  const trialEndsAt = user?.publicMetadata?.trialEndsAt as string
  const onboardingStep = user?.publicMetadata?.onboardingStep as string
  
  if (!trialEndsAt || onboardingStep !== "done") return null
  
  const endTime = new Date(trialEndsAt).getTime()
  if (isNaN(endTime)) return null

  const daysLeft = Math.ceil((endTime - Date.now()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft <= 0) return null
  
  return (
    <div className="w-full bg-[#534AB7] text-white px-6 py-3 flex items-center justify-between text-sm">
      <span>
        Tu bénéficies de toutes les fonctionnalités Business gratuitement 
        encore <strong>{daysLeft} jour{daysLeft > 1 ? "s" : ""}</strong>. 
        Choisis ton plan avant la fin de l'essai.
      </span>
      <button
        onClick={() => router.push("/dashboard/billing")}
        className="ml-4 bg-white text-[#534AB7] font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors whitespace-nowrap"
      >
        Voir les plans
      </button>
    </div>
  )
}
