"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { PlanType } from "@/lib/plan-limits";

interface PlanCardsProps {
  currentPlan: PlanType;
}

export function PlanCards({ currentPlan }: PlanCardsProps) {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "3 Social Accounts",
        "30 Posts / month",
        "1 Auto-Reply Rule",
        "7 Days Analytics",
        "Community Support",
      ],
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      cta: "Current Plan",
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$24",
      description: "Everything you need to grow",
      features: [
        "15 Social Accounts",
        "Unlimited Posts",
        "20 Auto-Reply Rules",
        "90 Days Analytics",
        "Recurring Posts",
        "AI Caption Generation",
        "Priority Support",
      ],
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      cta: "Upgrade to Pro",
      highlight: true,
    },
    {
      id: "agency",
      name: "Agency",
      price: "$99",
      description: "Scale your social presence",
      features: [
        "50 Social Accounts",
        "Unlimited everything",
        "100 Auto-Reply Rules",
        "365 Days Analytics",
        "Team Collaboration",
        "White-label Reports",
        "Dedicated Manager",
      ],
      icon: <Building2 className="w-5 h-5 text-orange-500" />,
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
            plan.highlight 
              ? "border-primary ring-2 ring-primary/20 shadow-lg scale-105 z-10" 
              : "border-border shadow-md"
          }`}
        >
          {plan.highlight && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {plan.icon}
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
              <span className="text-muted-foreground font-medium">/month</span>
            </div>
            <CardDescription className="pt-2">{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 rounded-full bg-primary/10 p-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={plan.id === currentPlan ? "outline" : plan.highlight ? "default" : "secondary"}
              disabled={plan.id === currentPlan}
            >
              {plan.id === currentPlan ? "Your Current Plan" : plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
