"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CircleHelp, CreditCard, Search, Settings, UserPlus } from "lucide-react";

import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { OrgSwitcher } from "@/components/ds/OrgSwitcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAccess } from "@/hooks/useAccess";

// Top Bar du design system Creatabl.ia (64px) : sélecteur d'organisation,
// recherche dans les publications, aide, notifications et compte.
export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const access = useAccess();
  const [query, setQuery] = useState("");

  // Les pages Équipe ont déjà leur propre bouton d'invitation.
  const isTeamPage = pathname.startsWith("/dashboard/equipe");

  return (
    <header className="cr-top sticky top-0 z-30 shrink-0 px-4 md:px-6">
      <SidebarTrigger className="md:hidden" aria-label="Ouvrir le menu" />

      <OrgSwitcher />

      <form
        role="search"
        className="cr-top-search hidden lg:block"
        onSubmit={(e) => {
          e.preventDefault();
          const q = query.trim();
          router.push(q ? `/dashboard/posts?q=${encodeURIComponent(q)}` : "/dashboard/posts");
        }}
      >
        <label className="cr-control">
          <Search size={18} aria-hidden="true" />
          <span className="cr-sr">Rechercher dans vos publications</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un post…"
          />
        </label>
      </form>

      <div className="cr-top-actions">
        {access.team && !isTeamPage && (
          <button
            type="button"
            className="cr-btn cr-btn--secondary cr-btn--sm hidden lg:inline-flex"
            style={{ marginRight: 8 }}
            onClick={() => router.push("/dashboard/equipe/membres?invite=true")}
          >
            <UserPlus size={16} aria-hidden="true" />
            Inviter un membre
          </button>
        )}
        <a
          className="cr-iconbtn hidden sm:grid"
          href="https://creatabl-ia.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Aide et contact"
        >
          <CircleHelp size={20} aria-hidden="true" />
        </a>
        <NotificationsPopover />
        <span style={{ marginLeft: 8, display: "inline-flex", width: 32, height: 32 }}>
          <UserButton appearance={{ elements: { avatarBox: "size-8" } }}>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Paramètres"
                labelIcon={<Settings className="size-4" />}
                href="/dashboard/settings"
              />
              <UserButton.Link
                label="Abonnement"
                labelIcon={<CreditCard className="size-4" />}
                href="/dashboard/billing"
              />
              <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
          </UserButton>
        </span>
      </div>
    </header>
  );
}
