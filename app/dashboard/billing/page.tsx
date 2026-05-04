import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { ArrowRight, CheckCircle2, Crown, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const today = new Date();
  const trialEndsAt = user.trialEndsAt;
  const isTrial = !!(trialEndsAt && trialEndsAt > today);
  const trialDaysLeft = (isTrial && trialEndsAt) ? Math.ceil((trialEndsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
    return "#7F77DD"; // Violet
  };

  const renderCircularProgress = (percentage: number, label: string, value: string | number) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage);
    const color = getProgressColor(percentage);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
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

      {/* SECTION 1 — Plan actuel */}
      <Card className="border-none shadow-sm ring-1 ring-foreground/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {isTrial ? (
                  <Badge className="bg-orange-100 text-orange-700 border-none px-3 py-1 text-sm font-semibold">
                    Essai gratuit
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 text-sm font-semibold">
                    Plan {user.selectedPlan?.charAt(0).toUpperCase()}{user.selectedPlan?.slice(1)} actif
                  </Badge>
                )}
              </div>
              <p className="text-lg font-medium text-foreground">
                {isTrial 
                  ? `Ton essai se termine dans ${trialDaysLeft} jours` 
                  : `Prochain renouvellement le ${new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                }
              </p>
            </div>
            {isTrial ? (
              <Button render={<Link href="/pricing" />} className="bg-[#7F77DD] hover:bg-[#6C64C5] text-white rounded-full px-6 h-12">
                Activer mon plan maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" className="rounded-full border-[#7F77DD] text-[#7F77DD] hover:bg-[#7F77DD]/5 px-6 h-12">
                Gérer mon abonnement
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2 — Consommation ce mois-ci */}
      <div className="space-y-4">
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

      {/* SECTION 3 — Promo upgrade */}
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
              <Button render={<Link href="/pricing" />} className="bg-[#7F77DD] hover:bg-[#6C64C5] text-white rounded-full px-8 h-14 text-lg">
                Passer au Pro <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
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
              <Button render={<Link href="/pricing" />} className="bg-[#10B981] hover:bg-[#059669] text-white rounded-full px-8 h-14 text-lg border-none">
                Passer au Business <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {planKey === 'business' && (
          <Card className="border-none bg-gray-50 shadow-none border border-dashed border-gray-200">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900">Tu es au maximum</h3>
              <p className="text-gray-500 max-w-sm">
                Tu profites de toutes les fonctionnalités de Creatabl. Merci de ta confiance !
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SECTION 4 — Historique de facturation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Historique de facturation</h2>
        <Card className="border-none shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Factures fictives si l'utilisateur est abonné, sinon message vide */}
              {user.subscriptionId ? (
                <TableRow>
                  <TableCell>{new Date().toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="capitalize">{user.selectedPlan}</TableCell>
                  <TableCell>{planKey === 'pro' ? '99€' : '199€'}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-medium">Payé</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-[#7F77DD]">Télécharger</Button>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Aucune facture pour l'instant
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
