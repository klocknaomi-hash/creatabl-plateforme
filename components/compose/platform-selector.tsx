"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import NetworkLogo, { toNetwork } from "@/components/ds/NetworkLogo";

interface Account {
  id: string;
  platform: string;
  username: string;
  avatarUrl?: string;
}

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onToggle: (platform: string) => void;
}

// Réseaux pris en charge par la publication, et ceux qui arrivent.
const SUPPORTED = ["instagram", "facebook", "linkedin", "twitter"] as const;
const SOON = ["tiktok"] as const;
const LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", twitter: "X", tiktok: "TikTok" };

// « Publier sur » (ComposerPage) : Network Tags du design system. Compte connecté :
// tag à bascule ; réseau non connecté : tag en pointillés qui mène à la connexion.
export function PlatformSelector({ selectedPlatforms, onToggle }: PlatformSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data.accounts || []))
      .catch((err) => console.error("Failed to fetch accounts", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#4B4B63]">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Chargement des comptes…
      </div>
    );
  }

  const connectedPlatforms = new Set(accounts.map((a) => a.platform.toLowerCase()));
  const missing = SUPPORTED.filter((p) => !connectedPlatforms.has(p));

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Comptes où publier">
      {accounts.map((account) => {
        const platform = account.platform.toLowerCase();
        const net = toNetwork(platform);
        const selected = selectedPlatforms.includes(account.platform);
        const name = account.username?.startsWith("@") ? account.username : `@${account.username}`;
        return (
          <button
            key={account.id}
            type="button"
            className="cr-net"
            aria-pressed={selected}
            onClick={() => onToggle(account.platform)}
            title={`${LABELS[platform] ?? platform} · ${name}`}
          >
            {net && <NetworkLogo name={net} size={18} />}
            <span className="max-w-[180px] truncate">{name}</span>
            <span className="cr-tick"><Check size={16} aria-hidden="true" /></span>
          </button>
        );
      })}

      {missing.map((p) => {
        const net = toNetwork(p);
        return (
          <Link key={p} href={`/api/oauth/${p}`} className="cr-net is-off">
            {net && <NetworkLogo name={net} size={18} />}
            Connecter {LABELS[p]}
          </Link>
        );
      })}

      {SOON.map((p) => {
        const net = toNetwork(p);
        return (
          <span key={p} className="cr-net" aria-disabled="true" style={{ opacity: 0.55, cursor: "not-allowed" }} title="Bientôt disponible">
            {net && <NetworkLogo name={net} size={18} />}
            {LABELS[p]} (bientôt)
          </span>
        );
      })}
    </div>
  );
}
