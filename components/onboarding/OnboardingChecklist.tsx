"use client";

import React from "react";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const CHECKLIST_ITEMS = [
  { id: "connect", label: "Connectez vos réseaux sociaux", href: "/dashboard/settings/connections" },
  { id: "post", label: "Générez un post", href: "/dashboard/compose" },
  { id: "ideas", label: "Générez des idées", href: "/dashboard/compose?tab=ideas" },
  { id: "analytics", label: "Analysez vos statistiques", href: "/dashboard/analytics" },
  { id: "engagement", label: "Créez une liste d'engagement", href: "/dashboard/settings/connections" },
];

export const OnboardingChecklist = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || user?.publicMetadata?.onboardingStep !== "done") return null;

  // In a real app, we would track completion status in metadata or DB
  // For now, we'll show 0/5 completed as requested
  const completedCount = 0;

  return (
    <div className="bg-white rounded-2xl p-8 border border-[#E8E6F0] shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#14121F]">Premiers pas</h3>
        <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E6F0] hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <Circle className="text-[#878399] group-hover:text-primary transition-colors" size={20} />
              <span className="text-[#4B4B63] font-medium">{item.label}</span>
            </div>
            <ChevronRight className="text-[#6B6780] group-hover:text-primary transition-all transform group-hover:translate-x-1" size={18} />
          </Link>
        ))}
      </div>
    </div>
  );
};
