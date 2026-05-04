import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";
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

  const postLimit = limits.posts;
  const aiLimit = limits.ai;

  const postPercentage = Math.min(postCount / postLimit, 1);
  const aiPercentage = Math.min(aiCount / aiLimit, 1);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 1) return "#EF4444"; // Red
    if (percentage >= 0.8) return "#F59E0B"; // Orange
    return "#6366F1"; // Violet
  };

  const renderCircularProgress = (percentage: number, label: string, value: string | number, size = 140, radius = 54) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage);
    const color = getProgressColor(percentage);

    return (
      <div className="flex flex-col items-center gap-4">
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
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center transform rotate-90">
            <span className="text-2xl font-bold text-foreground">{value}</span>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
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
            <div className="relative flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke={trialDaysLeft > 3 ? "#6366F1" : "#F59E0B"}
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
                  Essai gratuit en cours
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Ton essai gratuit se termine le {user.trialEndsAt?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-gray-500 max-w-lg">
                Profite de toutes les fonctionnalités de ton plan {user.selectedPlan}. 
                Une fois l&apos;essai terminé, tes données seront conservées mais l&apos;accès sera limité.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION — Choix du plan (si trial ou pas encore abonné) */}
      {(!user.isSubscribed) && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Active ton abonnement</h2>
          <BillingPlans currentPlan={user.selectedPlan || 'starter'} />
        </div>
      )}

      {/* SECTION 2 — Consommation ce mois-ci */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold text-foreground">Consommation ce mois-ci</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm ring-1 ring-foreground/5">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {renderCircularProgress(
                postPercentage, 
                "posts ce mois-ci", 
                planKey === 'business' ? "∞" : `${postCount} / ${postLimit}`
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-foreground/5">
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {renderCircularProgress(
                aiPercentage, 
                "générations IA ce mois-ci", 
                planKey === 'business' ? "∞" : `${aiCount} / ${aiLimit}`
              )}
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-sm text-muted-foreground">Remise à zéro le 1er de chaque mois</p>
      </div>

      {/* SECTION 3 — Promo upgrade (si déjà abonné mais peut monter) */}
      {user.isSubscribed && (
        <div className="space-y-4">
          {planKey === 'starter' && (
            <Card className="border-none bg-[#EEEDFE] shadow-none">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-[#7F77DD]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2D2A4A]">Passe au plan Pro 🚀</h3>
                  </div>
                  <p className="text-[#5D5A88] max-w-md">
                    Débloque Reformuler, Changer le ton, 120 posts/mois et Analytics avancés.
                  </p>
                  <div className="text-xl font-bold text-[#2D2A4A]">
                    99€/mois <span className="text-sm font-normal text-[#5D5A88]">ou 79€/mois en annuel</span>
                  </div>
                </div>
                <button className="bg-[#7F77DD] hover:bg-[#6C64C5] text-white rounded-full px-8 h-14 text-lg font-bold flex items-center gap-2">
                  Passer au Pro <ArrowRight className="h-5 w-5" />
                </button>
              </CardContent>
            </Card>
          )}

          {planKey === 'pro' && (
            <Card className="border-none bg-[#E1F5EE] shadow-none">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-[#10B981]">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1F2937]">Passe au plan Business 🏢</h3>
                  </div>
                  <p className="text-[#4B5563] max-w-md">
                    Gère plusieurs clients avec multi-comptes, équipe et 500 posts/mois.
                  </p>
                  <div className="text-xl font-bold text-[#1F2937]">
                    199€/mois <span className="text-sm font-normal text-[#4B5563]">ou 159€/mois en annuel</span>
                  </div>
                </div>
                <button className="bg-[#10B981] hover:bg-[#059669] text-white rounded-full px-8 h-14 text-lg font-bold flex items-center gap-2 border-none">
                  Passer au Business <ArrowRight className="h-5 w-5" />
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
