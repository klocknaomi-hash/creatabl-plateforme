import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Clock, CheckCircle2 } from "lucide-react";
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

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-lg">Gère ton plan et consulte tes jours d'essai.</p>
      </div>

      {/* SECTION TRIAL (KEEP EXISTING) */}
      {isTrial && (
        <Card className="border-none shadow-2xl shadow-primary/10 bg-white overflow-hidden rounded-[32px] ring-1 ring-gray-100">
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle cx="90" cy="90" r="76" fill="none" stroke="#F8F7FF" strokeWidth="16" />
                <circle
                  cx="90"
                  cy="90"
                  r="76"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeDasharray={2 * Math.PI * 76}
                  strokeDashoffset={2 * Math.PI * 76 * (1 - trialDaysLeft / 7)}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-90">
                <span className="text-5xl font-black text-gray-900 leading-none">{trialDaysLeft}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">jours</span>
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold rounded-full">
                    Ton essai gratuit Business
                  </Badge>
                </div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  Tu as {trialDaysLeft} jours restants sur ton essai Business gratuit
                </h2>
                <p className="text-gray-500 text-lg">
                  Profite de toutes les fonctionnalités pour booster ta présence en ligne. 
                  Ton plan sélectionné à l'inscription est le plan <strong>{user.selectedPlan?.toUpperCase()}</strong>.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-full">
                   <CheckCircle2 className="w-4 h-4 text-green-500" />
                   Accès complet Business
                 </div>
                 <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-full">
                   <Clock className="w-4 h-4 text-primary" />
                   Expension automatique
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION CHOISIR UN PLAN (UPDATED) */}
      <div className="space-y-8">
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Choisir ton plan</h2>
          <p className="text-sm text-gray-500">Sélectionne le forfait qui te convient le mieux après ton essai.</p>
        </div>
        <BillingPlans currentPlan={user.plan || 'starter'} selectedPlan={user.selectedPlan || 'starter'} />
      </div>

      {/* BANDEAU SECURITE */}
      <div className="rounded-[24px] bg-gray-50/50 py-8 px-8 text-center border border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-sm font-bold text-gray-600 flex items-center justify-center gap-3">
            <Lock className="w-5 h-5 text-[#534AB7]" />
            Paiements 100% sécurisés via Stripe
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Creatabl utilise Stripe pour la gestion des paiements. Nous ne stockons jamais vos informations de carte bancaire. 
            Vous pouvez annuler ou modifier votre abonnement à tout moment depuis cet espace.
          </p>
        </div>
      </div>
    </div>
  );
}
