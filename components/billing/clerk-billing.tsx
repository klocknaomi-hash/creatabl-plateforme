"use client";

import { PricingTable } from "@clerk/nextjs";
import { ErrorBoundary } from "@/components/error-boundary";

export function ClerkPricingTable() {
  const isBillingEnabled = process.env.NEXT_PUBLIC_CLERK_BILLING_ENABLED === "true";

  if (!isBillingEnabled) {
    return (
      <div className="p-8 border rounded-xl bg-muted/30 text-center space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Billing Feature Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We are currently setting up our billing system. Please contact support if you have questions about pricing or would like early access to premium features.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ErrorBoundary 
        fallback={
          <div className="p-8 border rounded-xl bg-muted/30 text-center space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Billing Not Configured</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The billing system is currently being set up in the Clerk dashboard. Please check back later.
            </p>
          </div>
        }
      >
        <PricingTable />
      </ErrorBoundary>
    </div>
  );
}
