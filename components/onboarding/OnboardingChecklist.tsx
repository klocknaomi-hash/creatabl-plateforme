"use client";

import React from "react";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const CHECKLIST_ITEMS = [
  { id: "connect", label: "Connecte tes réseaux sociaux", href: "/dashboard/settings/connections" },
  { id: "post", label: "Génère un post", href: "/dashboard/compose" },
  { id: "ideas", label: "Génère des idées", href: "/dashboard/compose?tab=ideas" },
  { id: "analytics", label: "Analyse tes métriques", href: "/dashboard/analytics" },
  { id: "engagement", label: "Crée une liste d'engagement", href: "/dashboard/settings/connections" },
];

export const OnboardingChecklist = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || user?.publicMetadata?.onboardingStep !== "done") return null;

  // In a real app, we would track completion status in metadata or DB
  // For now, we'll show 0/5 completed as requested
  const completedCount = 0;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Premiers pas</h3>
        <span className="text-sm font-semibold text-[#534AB7] bg-[#534AB7]/10 px-3 py-1 rounded-full">
          {completedCount}/{CHECKLIST_ITEMS.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-[#534AB7]/30 hover:bg-[#534AB7]/5 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <Circle className="text-gray-300 group-hover:text-[#534AB7] transition-colors" size={20} />
              <span className="text-gray-700 font-medium">{item.label}</span>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-[#534AB7] transition-all transform group-hover:translate-x-1" size={18} />
          </Link>
        ))}
      </div>
    </div>
  );
};
