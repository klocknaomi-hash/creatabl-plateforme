"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import { Check, ChevronDown, Plus } from "lucide-react";

// Sélecteur d'organisation de la Top Bar (design system Creatabl.ia : pilule `cr-org`
// et menu `cr-menu`). Il s'appuie sur les organisations Clerk de l'utilisateur :
// changer d'organisation, revenir au compte personnel, en créer une nouvelle.

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

const ROLE_LABELS: Record<string, string> = {
  "org:admin": "Administrateur",
  "org:member": "Membre",
  admin: "Administrateur",
  basic_member: "Membre",
};

export function OrgSwitcher() {
  const router = useRouter();
  const { user } = useUser();
  const { openCreateOrganization } = useClerk();
  const { organization } = useOrganization();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const personalName = user?.fullName || user?.username || "Compte personnel";
  const currentName = organization?.name ?? personalName;
  const currentType = organization ? "Organisation" : "Compte personnel";

  async function select(orgId: string | null) {
    setOpen(false);
    if (!setActive) return;
    if ((organization?.id ?? null) === orgId) return;
    await setActive({ organization: orgId });
    router.push("/dashboard");
    router.refresh();
  }

  const memberships = userMemberships?.data ?? [];

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        className="cr-org max-w-[260px]"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cr-org-mark" style={organization ? undefined : { background: "var(--violet-600)" }}>
          {initials(currentName)}
        </span>
        <span className="min-w-0 truncate text-left">
          <span className="block truncate">{currentName}</span>
          <small>{currentType}</small>
        </span>
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[var(--ink-muted)]" />
      </button>

      {open && (
        <div
          className="cr-menu absolute left-0 top-[52px] z-50 w-[300px] max-w-[calc(100vw-32px)]"
          role="listbox"
          aria-label="Organisations"
        >
          <div className="cr-menu-label">Vos organisations</div>
          <button
            type="button"
            className="cr-menu-item"
            role="option"
            aria-selected={!organization}
            onClick={() => select(null)}
          >
            <span className="cr-org-mark" style={{ background: "var(--violet-600)" }}>{initials(personalName)}</span>
            <span className="min-w-0">
              <strong className="block truncate" style={{ fontWeight: organization ? 500 : 600 }}>{personalName}</strong>
              <small className="cr-subtle" style={{ fontSize: 12 }}>Compte personnel</small>
            </span>
            {!organization && <span className="cr-check"><Check size={18} aria-hidden="true" /></span>}
          </button>
          {!isLoaded && <div className="cr-menu-label">Chargement…</div>}
          {memberships.map((m) => {
            const selected = organization?.id === m.organization.id;
            const members = m.organization.membersCount;
            const role = ROLE_LABELS[m.role] ?? "Membre";
            return (
              <button
                key={m.id}
                type="button"
                className="cr-menu-item"
                role="option"
                aria-selected={selected}
                onClick={() => select(m.organization.id)}
              >
                <span className="cr-org-mark">{initials(m.organization.name)}</span>
                <span className="min-w-0">
                  <strong className="block truncate" style={{ fontWeight: selected ? 600 : 500 }}>{m.organization.name}</strong>
                  <small className="cr-subtle" style={{ fontSize: 12 }}>
                    {members} membre{members > 1 ? "s" : ""} · {role}
                  </small>
                </span>
                {selected && <span className="cr-check"><Check size={18} aria-hidden="true" /></span>}
              </button>
            );
          })}
          {userMemberships?.hasNextPage && (
            <button type="button" className="cr-menu-item" onClick={() => userMemberships.fetchNext?.()}>
              Afficher plus
            </button>
          )}
          <div className="cr-menu-sep" />
          <button
            type="button"
            className="cr-menu-item"
            onClick={() => {
              setOpen(false);
              openCreateOrganization({ afterCreateOrganizationUrl: "/dashboard/settings/workspace" });
            }}
          >
            <Plus size={18} aria-hidden="true" />
            Nouvelle organisation
          </button>
        </div>
      )}
    </div>
  );
}
