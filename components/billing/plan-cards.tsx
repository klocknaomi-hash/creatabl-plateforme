"use client";

import React, { useState } from "react";
import { Check, X, Sparkles, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PlanType = "free" | "starter" | "pro" | "business";

interface PlanCardsProps {
  currentPlan?: string;
  selectedPlan?: string;
}

const SOCIAL_ICONS = {
  li: (
    <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  ig: (
    <svg className="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.735.079-2.92.353-3.956 1.389-1.036 1.036-1.31 2.221-1.389 3.956-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.079 1.735.353 2.92 1.389 3.956 1.036 1.036 2.221 1.31 3.956 1.389 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.735-.079 2.92-.353 3.956-1.389 1.036-1.036 1.31-2.221 1.389-3.956.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.079-1.735-.353-2.92-1.389-3.956-1.036-1.036-2.221-1.31-3.956-1.389-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  fb: (
    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tt: (
    <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-3.33 2.76-6.13 6.13-6.49 1.17-.12 2.35.06 3.44.53V9.07c-1.38-.45-2.88-.51-4.27-.12-1.52.41-2.81 1.47-3.51 2.87-.51.98-.71 2.09-.64 3.19.12 2.1 1.57 4 3.52 4.79 1.17.49 2.5.56 3.72.19 1.75-.52 3.19-1.92 3.73-3.63.15-.46.22-.93.24-1.41.04-3.58.02-7.16.03-10.74z" />
    </svg>
  ),
  yt: (
    <svg className="w-5 h-5 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  pt: (
    <svg className="w-5 h-5 text-[#BD081C]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.259 7.929-7.259 4.164 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 12.017 0z" />
    </svg>
  ),
};

export function PlanCards({ currentPlan = "starter", selectedPlan }: PlanCardsProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const normalizedCurrent = currentPlan.toLowerCase();
  const normalizedSelected = selectedPlan?.toLowerCase();

  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: 0,
      yearlyMonthly: 0,
      description: "Pour découvrir Creatabl sans engagement",
      subtext: "Pour toujours · Sans carte bancaire",
      socials: ["li", "ig", "fb", "x"],
      features: [
        { text: "20 posts / mois", included: true },
        { text: "Assistant IA de rédaction (basique)", included: true },
        { text: "LinkedIn, Instagram, Facebook, X", included: true },
        { text: "Calendrier éditorial", included: true },
        { text: "Analytics avancés", included: false },
        { text: "Suggestions d'idées IA", included: false },
        { text: "Multi-comptes", included: false },
        { text: "Support prioritaire", included: false },
      ],
      icon: <Zap className="w-5 h-5 text-purple-600" />,
      buttonStyle: "border border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100/80 transition-all font-bold",
      cta: "Continuer en Free",
      popularBadge: false,
    },
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 49,
      yearlyMonthly: 39,
      description: "Pour les solopreneurs qui démarrent",
      subtext: "14 jours d'essai gratuit (CB)",
      socials: ["li", "ig", "fb", "x"],
      features: [
        { text: "30 posts / mois", included: true },
        { text: "Assistant IA de rédaction (limité)", included: true },
        { text: "LinkedIn, Instagram, Facebook, X", included: true },
        { text: "Calendrier éditorial", included: true },
        { text: "Analytics essentiels", included: true },
        { text: "Intégration Canva", included: true },
        { text: "Multi-comptes", included: false },
        { text: "Support prioritaire", included: false },
      ],
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      buttonStyle: "border-2 border-[#7C3AED] text-[#7C3AED] bg-white hover:bg-[#7C3AED]/5 font-bold",
      cta: "Passer au Starter",
      popularBadge: false,
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 99,
      yearlyMonthly: 79,
      description: "Pour les créateurs actifs qui veulent scaler",
      subtext: "14 jours d'essai gratuit (CB)",
      socials: ["li", "ig", "fb", "x", "tt", "yt"],
      features: [
        { text: "120 posts / mois", included: true },
        { text: "Assistant IA de rédaction (illimité)", included: true },
        { text: "Suggestions d'idées IA", included: true },
        { text: "Reformuler & Tons IA (5 tons)", included: true },
        { text: "Analytics avancés + graphiques", included: true },
        { text: "Intégration Canva", included: true },
        { text: "Multi-comptes", included: false },
        { text: "Support prioritaire", included: false },
      ],
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      buttonStyle: "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-md hover:shadow-lg font-bold",
      cta: "Passer au Pro",
      popularBadge: true,
    },
    {
      id: "business",
      name: "Business",
      monthlyPrice: 199,
      yearlyMonthly: 159,
      description: "Pour les agences et équipes marketing",
      subtext: "14 jours d'essai gratuit (CB)",
      socials: ["li", "ig", "fb", "x", "tt", "yt", "pt"],
      features: [
        { text: "300 posts / mois", included: true },
        { text: "Assistant IA de rédaction (illimité)", included: true },
        { text: "Suggestions d'idées IA", included: true },
        { text: "Multi-comptes (jusqu'à 5)", included: true },
        { text: "Gestion équipe + rôles", included: true },
        { text: "Analytics tous comptes (365 j)", included: true },
        { text: "Agent IA", included: true },
        { text: "Support prioritaire", included: true },
      ],
      icon: <Building2 className="w-5 h-5 text-emerald-500" />,
      buttonStyle: "bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg font-bold",
      cta: "Passer au Business",
      popularBadge: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === normalizedCurrent) return;

    if (planId === "free") {
      const confirmDowngrade = window.confirm(
        "Es-tu sûr de vouloir continuer en plan Free ? Tes fonctionnalités avancées seront limitées aux quotas du plan gratuit."
      );
      if (confirmDowngrade) {
        window.location.href = `/api/stripe/downgrade-free`;
      }
      return;
    }

    window.location.href = `/api/stripe/create-checkout?plan=${planId}&billing=${billing}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full px-2">
      {/* Toggle Billing Mensuel / Annuel */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1.5 rounded-full flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${
              billing === "monthly" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
              billing === "yearly" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Annuel
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Grid container for 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full">
        {plans.map((plan) => {
          const isCurrent = plan.id === normalizedCurrent;
          const isSelectedChoice = plan.id === normalizedSelected;
          const displayPrice = billing === "monthly" ? plan.monthlyPrice : plan.yearlyMonthly;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border shadow-sm hover:shadow-xl ${
                plan.popularBadge
                  ? "border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20 shadow-md"
                  : isSelectedChoice
                  ? "border-purple-600 ring-2 ring-purple-600/20"
                  : "border-gray-200"
              }`}
            >
              {/* Badges */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center z-10">
                {plan.popularBadge && (
                  <span className="bg-[#8B5CF6] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                    Le plus populaire
                  </span>
                )}
                {!plan.popularBadge && isSelectedChoice && (
                  <span className="bg-purple-700 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                    TON CHOIX
                  </span>
                )}
              </div>

              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {plan.icon}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>

                <p className="text-xs text-gray-500 italic min-h-[32px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight text-gray-900">
                      {displayPrice}€
                    </span>
                    <span className="text-gray-500 font-bold text-sm">/mois</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mt-1">{plan.subtext}</p>
                </div>

                <div className="h-px bg-gray-100 w-full my-4" />

                {/* Social icons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Réseaux sociaux
                  </span>
                  <div className="flex gap-2">
                    {Object.entries(SOCIAL_ICONS).map(([key, icon]) => {
                      const isActive = plan.socials.includes(key);
                      return (
                        <div key={key} className={isActive ? "opacity-100" : "grayscale opacity-25"}>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Fonctionnalités
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        {feature.included ? (
                          <div className="mt-0.5 rounded-full bg-emerald-50 p-0.5 flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="mt-0.5 rounded-full bg-gray-100 p-0.5 flex-shrink-0">
                            <X className="w-3.5 h-3.5 text-gray-400 stroke-[2]" />
                          </div>
                        )}
                        <span
                          className={`font-medium ${
                            feature.included ? "text-gray-700" : "text-gray-400 line-through opacity-70"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-auto">
                <Button
                  className={`w-full py-5 rounded-xl text-xs uppercase tracking-wider transition-all ${plan.buttonStyle}`}
                  variant="outline"
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrent ? "Plan actuel" : plan.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
