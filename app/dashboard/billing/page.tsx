import { auth } from "@clerk/nextjs/server";
import { getUsage } from "@/lib/usage";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SubscriptionCard } from "@/components/billing/subscription-card";
import { PremiumBenefits } from "@/components/billing/premium-benefits";
import { InvoiceHistory } from "@/components/billing/invoice-history";
import { PlanType } from "@/lib/plan-limits";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const usageData = await getUsage(user.clerkId);

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Facturation & Abonnement</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Gérez votre abonnement et consultez vos limites de consommation.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">
          <SubscriptionCard usageData={usageData} plan={user.plan as PlanType} />
        </div>
        <div className="lg:col-span-4 h-full">
          <PremiumBenefits plan={user.plan as PlanType} />
        </div>
      </div>

      {/* Invoice History Block */}
      <div className="max-w-4xl">
        <InvoiceHistory />
      </div>
    </div>
  );
}
