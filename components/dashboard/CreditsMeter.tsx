"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Credits = {
  plan: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string;
};

// Crédits du mois dans la barre latérale : 1 crédit = 1 post programmé ou publié.
export function CreditsMeter() {
  const [credits, setCredits] = useState<Credits | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/credits")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && !data.error) setCredits(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!credits) return null;

  const resetLabel = new Date(credits.resetAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const unlimited = credits.limit === null;
  const percent = unlimited ? 0 : Math.min(100, Math.round((credits.used / Math.max(1, credits.limit!)) * 100));
  const low = !unlimited && credits.remaining !== null && credits.remaining <= Math.ceil(credits.limit! * 0.1);

  return (
    <div className="bg-[#7225E3]/5 border border-[#7225E3]/10 rounded-2xl p-4 space-y-2 group-data-[collapsible=icon]:hidden">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-[#7225E3] leading-none">Crédits</span>
        <span className="text-xs font-semibold text-gray-900 tabular-nums">
          {unlimited ? `${credits.used} · illimités` : `${credits.used} / ${credits.limit}`}
        </span>
      </div>
      {!unlimited && (
        <div
          className="h-2 w-full bg-purple-100/60 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Crédits utilisés ce mois-ci"
          aria-valuenow={credits.used}
          aria-valuemin={0}
          aria-valuemax={credits.limit!}
        >
          <div className="h-full bg-[#7225E3] rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      )}
      <p className="text-[11px] text-gray-500 font-medium leading-snug">
        1 crédit = 1 post programmé ou publié. Renouvelés le {resetLabel}.
      </p>
      {low && (
        <Link href="/dashboard/billing" className="block text-[11px] font-semibold text-[#7225E3] hover:underline">
          {credits.remaining === 0 ? "Plus de crédits ce mois-ci : changer de plan" : `Plus que ${credits.remaining} crédit${credits.remaining! > 1 ? "s" : ""} : changer de plan`}
        </Link>
      )}
    </div>
  );
}
