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
    email: user.email,
  });

  const isTrial = trialStatus.status === 'trial';
  const trialDaysLeft = trialStatus.daysLeft || 0;

  // Dynamically calculate total trial duration in days
  const totalDays = user.trialStartedAt && user.trialEndsAt
    ? Math.max(1, Math.ceil((new Date(user.trialEndsAt).getTime() - new Date(user.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 7; // Fallback to 7 days if start date is not set

  // Calculate accurate remaining progress ratio
  const progress = totalDays > 0 ? Math.max(0, Math.min(1, trialDaysLeft / totalDays)) : 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Abonnement</h1>
          <p className="text-sm text-muted-foreground">Gère ton plan et consulte tes jours d'essai.</p>
        </div>
      </header>

      {/* SECTION TRIAL */}
      {isTrial && (
        <Card className="border-none shadow-2xl shadow-primary/10 bg-white overflow-hidden rounded-[2rem] ring-1 ring-gray-100">
          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#F5F3FF" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - progress)}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900 leading-none">{trialDaysLeft}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">jours</span>
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Ton essai gratuit Business
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Tu as {trialDaysLeft} jours restants sur ton essai Business gratuit
                </h2>
                <p className="text-sm text-gray-500">
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
                   Extension automatique
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION CHOISIR UN PLAN (UPDATED) */}
      <div className="space-y-8">
        <BillingPlans currentPlan={user.plan || 'starter'} selectedPlan={user.selectedPlan || 'starter'} />
      </div>

      {/* BANDEAU SECURITE */}
      <div className="rounded-2xl bg-gray-50/50 py-8 px-8 text-center border border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-sm font-bold text-gray-600 flex items-center justify-center gap-3">
            <Lock className="w-5 h-5 text-[#7C3AED]" />
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
