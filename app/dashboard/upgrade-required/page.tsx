import { PlanCards } from '@/components/billing/plan-cards'

// Fin de l'essai : choix d'un plan payant ou passage au plan Free.
export default function UpgradeRequiredPage() {
  return (
    <div className="w-full max-w-[1400px] px-4 py-10 md:px-10">
      <div className="mb-10 space-y-3 text-center">
        <span className="cr-badge cr-badge--warning">Essai terminé</span>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em] text-[#14121F] md:text-4xl">
          Votre essai gratuit est terminé
        </h1>
        <p className="mx-auto max-w-xl text-base text-[#4B4B63]">
          Choisissez un abonnement pour retrouver toutes vos fonctionnalités, ou continuez avec le plan Free (20 crédits par mois).
        </p>
      </div>
      <PlanCards variant="expired" />
    </div>
  )
}
