"use client";

import { PlanCards } from "@/components/billing/plan-cards";

interface BillingPlansProps {
  currentPlan: string;
  selectedPlan: string;
}

export function BillingPlans({ currentPlan, selectedPlan }: BillingPlansProps) {
  return <PlanCards currentPlan={currentPlan} selectedPlan={selectedPlan} />;
}
