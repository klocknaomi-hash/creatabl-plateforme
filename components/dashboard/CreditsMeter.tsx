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
        if (!cancelled && data && !data.error && typeof data.used === "number") setCredits(data);
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

  // Compteur `cr-meter` du design system (Sidebar).
  return (
    <div className="cr-meter group-data-[collapsible=icon]:hidden">
      <div className="cr-meter-head">
        <span>Crédits</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {unlimited ? `${credits.used} · illimités` : `${credits.used} / ${credits.limit}`}
        </span>
      </div>
      {!unlimited && (
        <div
          className="cr-bar"
          role="progressbar"
          aria-label="Crédits utilisés ce mois-ci"
          aria-valuenow={credits.used}
          aria-valuemin={0}
          aria-valuemax={credits.limit!}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      )}
      <span>1 crédit = 1 post programmé ou publié. Renouvelés le {resetLabel}.</span>
      {low && (
        <Link href="/dashboard/billing" className="cr-link" style={{ fontSize: 12, lineHeight: "18px" }}>
          {credits.remaining === 0 ? "Plus de crédits ce mois-ci : changer de plan" : `Plus que ${credits.remaining} crédit${credits.remaining! > 1 ? "s" : ""} : changer de plan`}
        </Link>
      )}
    </div>
  );
}
