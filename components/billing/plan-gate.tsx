"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface PlanGateProps {
  children: ReactNode;
  plan?: "pro" | "business";
  showUpgrade?: boolean;
}

export function PlanGate({ children, plan = "pro", showUpgrade = true }: PlanGateProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const currentPlan = (user?.publicMetadata?.plan as string) || "starter";
  
  const hasAccess = 
    (plan === "pro" && (currentPlan === "pro" || currentPlan === "business")) ||
    (plan === "business" && currentPlan === "business");

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgrade) return null;

  return (
    <Card className="border-dashed bg-muted/50">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          {plan.charAt(0).toUpperCase() + plan.slice(1)} Feature
        </CardTitle>
        <CardDescription>
          This feature is only available on the {plan} plan and above.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center pb-6">
        <Link 
          href="https://creatabl-ia.com/tarifs" 
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Upgrade Now
        </Link>
      </CardFooter>
    </Card>
  );
}
