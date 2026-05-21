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
      id: "starter",
      name: "Starter",
      price: "0€",
      description: "Essai gratuit de 7 jours",
      features: [
        "30 Posts / mois",
        "30 Générations IA",
        "7 Jours Analytics",
        "Support standard",
      ],
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      cta: "Plan actuel",
      highlight: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "99€",
      description: "Pour booster ta croissance",
      features: [
        "120 Posts / mois",
        "120 Générations IA",
        "90 Jours Analytics",
        "Reformuler & Tons IA",
        "Analytics avancés",
        "Support prioritaire",
      ],
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      cta: "Passer au Pro",
      highlight: true,
    },
    {
      id: "business",
      name: "Business",
      price: "199€",
      description: "Pour les agences et équipes",
      features: [
        "300 Posts / mois (∞)",
        "300 Générations IA (∞)",
        "365 Jours Analytics",
        "Multi-comptes équipe",
        "Gestion clients",
        "Manager dédié",
      ],
      icon: <Building2 className="w-5 h-5 text-emerald-500" />,
      cta: "Passer au Business",
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
                Le plus populaire
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
              <span className="text-muted-foreground font-medium">/mois</span>
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
              {plan.id === currentPlan ? "Ton plan actuel" : plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
