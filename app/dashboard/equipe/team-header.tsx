"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { Building2, Settings2 } from "lucide-react";

const TABS = [
  { label: "Membres", href: "/dashboard/equipe/membres", match: (p: string, v: string | null) => p.startsWith("/dashboard/equipe/membres") && v !== "invitations" },
  { label: "Invitations", href: "/dashboard/equipe/membres?vue=invitations", match: (p: string, v: string | null) => p.startsWith("/dashboard/equipe/membres") && v === "invitations" },
  { label: "Projets", href: "/dashboard/equipe/projets", match: (p: string) => p.startsWith("/dashboard/equipe/projets") },
];

export function TeamHeader() {
  const pathname = usePathname();
  const view = useSearchParams().get("vue");
  const { organization, isLoaded } = useOrganization();
  const pendingCount = organization?.pendingInvitationsCount ?? 0;

  return (
    <header className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-[-0.01em] text-[#14121F]">Équipe</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#4B4B63]">
            <Building2 size={16} aria-hidden="true" />
            {!isLoaded ? (
              "Chargement de l'organisation…"
            ) : organization ? (
              <>
                Organisation : <strong className="font-semibold text-[#14121F]">{organization.name}</strong>
                <span aria-hidden="true">·</span>
                {organization.membersCount} membre{organization.membersCount > 1 ? "s" : ""}
              </>
            ) : (
              "Espace personnel : créez une organisation pour inviter votre équipe."
            )}
          </p>
        </div>
        <Link href="/dashboard/settings/workspace" className="cr-btn cr-btn--secondary cr-btn--sm">
          <Settings2 size={16} aria-hidden="true" />
          Gérer l&apos;organisation
        </Link>
      </div>
      <nav className="cr-tabs" role="tablist" aria-label="Sections de l'équipe">
        {TABS.map((t) => {
          const active = t.match(pathname, view);
          return (
            <Link key={t.label} href={t.href} role="tab" aria-selected={active} className="cr-tab">
              {t.label}
              {t.label === "Invitations" && pendingCount > 0 && <span className="cr-count">{pendingCount}</span>}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
