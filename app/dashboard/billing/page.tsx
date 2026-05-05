import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { Lock } from "lucide-react";
import { getTrialStatus } from "@/lib/trial";
import { BillingPlans } from "./billing-plans";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const trialStatus = getTrialStatus({
    trialStartedAt: user.trialStartedAt,
    trialEndsAt: user.trialEndsAt,
    isSubscribed: user.isSubscribed ?? false,
  });

  const isTrial = trialStatus.status === 'trial';
  const trialDaysLeft = trialStatus.daysLeft || 0;

  const planKey = (user.selectedPlan || "starter") as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey];

  const postCount = user.monthlyPostCount || 0;
  const aiCount = user.monthlyAiCount || 0;

  const isBusiness = planKey === 'business' || planKey === 'agency';

  const postLimit = limits.posts;
  const aiLimit = limits.ai;

  const postPercentage = isBusiness ? 0 : Math.min(postCount / postLimit, 1);
  const aiPercentage = isBusiness ? 0 : Math.min(aiCount / aiLimit, 1);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 1) return "#EF4444"; // Red
    if (percentage >= 0.8) return "#F59E0B"; // Orange
    return "#7F77DD"; // Violet
  };

  const renderCircularProgress = (
    percentage: number,
    label: string,
    detailText: string,
    value: string | number,
    size = 140,
    radius = 54
  ) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage);
    const color = isBusiness ? "#7F77DD" : getProgressColor(percentage);
    const pct = Math.round(percentage * 100);

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="10"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={isBusiness ? 0 : offset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center transform rotate-90">
            <span className="text-2xl font-bold text-foreground">{value}</span>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground text-center">{label}</p>
        {/* Detail text */}
        <p className="text-xs text-gray-500 text-center -mt-2">{detailText}</p>
        {/* Linear progress bar */}
        {!isBusiness && (
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{pct}% utilisé</span>
              <span>{postLimit}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Facturation</h1>
        <p className="text-muted-foreground">Gère ton abonnement et consulte ta consommation.</p>
      </div>

      {/* SECTION TRIAL — Uniquement si en essai */}
      {isTrial && (
        <Card className="border-none shadow-xl ring-1 ring-foreground/5 bg-white overflow-hidden">
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke={trialDaysLeft > 3 ? "#7F77DD" : "#F59E0B"}
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - trialDaysLeft / 7)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-90">
                <span className="text-5xl font-black text-gray-900">{trialDaysLeft}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">jours restants</span>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Badge className={trialDaysLeft > 3 ? "bg-indigo-100 text-indigo-700 border-none" : "bg-orange-100 text-orange-700 border-none"}>
                  {trialDaysLeft <= 3 ? "⚠️ Essai bientôt terminé !" : "Essai gratuit en cours"}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {trialDaysLeft <= 3
                  ? `Plus que ${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''} — abonne-toi maintenant !`
                  : `Ton essai gratuit se termine le ${user.trialEndsAt?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                }
              </h2>
              <p className="text-gray-500 max-w-lg">
                {trialDaysLeft <= 3
                  ? "Ton accès sera limité dans moins de 72h. Active ton abonnement pour ne rien perdre."
                  : `Profite de toutes les fonctionnalités de ton plan ${user.selectedPlan}. Une fois l'essai terminé, tes données seront conservées mais l'accès sera limité.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION — Plans (toujours visible) */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Ton abonnement</h2>
        <BillingPlans currentPlan={user.selectedPlan || 'starter'} />
      </div>

      {/* SECTION 2 — Consommation ce mois-ci */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold text-foreground">Consommation ce mois-ci</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm ring-1 ring-foreground/5">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {renderCircularProgress(
                postPercentage,
                "Posts ce mois-ci",
                isBusiness
                  ? "Illimité sur votre plan Business"
                  : `${postCount} posts utilisés sur ${postLimit} ce mois-ci`,
                isBusiness ? "∞" : `${postCount} / ${postLimit}`
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-foreground/5">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {renderCircularProgress(
                aiPercentage,
                "Générations IA ce mois-ci",
                isBusiness
                  ? "Illimité sur votre plan Business"
                  : `${aiCount} générations utilisées sur ${aiLimit} ce mois-ci`,
                isBusiness ? "∞" : `${aiCount} / ${aiLimit}`
              )}
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-sm text-muted-foreground">Remise à zéro le 1er de chaque mois</p>
      </div>



      {/* Bandeau sécurité bas de page */}
      <div className="rounded-2xl bg-gray-50 py-5 px-6 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Paiement sécurisé · Annulez à tout moment · Données hébergées en Europe
        </p>
      </div>
    </div>
  );
}
