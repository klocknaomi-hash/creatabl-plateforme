import { auth } from "@clerk/nextjs/server";
import { getUsage } from "@/lib/usage";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SubscriptionCard } from "@/components/billing/subscription-card";
import { PremiumBenefits } from "@/components/billing/premium-benefits";
import { InvoiceHistory } from "@/components/billing/invoice-history";
import { PlanType } from "@/lib/plan-limits";

export default async function BillingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) redirect("/onboarding");

  const usageData = await getUsage(clerkId);

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="space-y-1 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Manage your plan, billing details, and view your usage limits.
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
