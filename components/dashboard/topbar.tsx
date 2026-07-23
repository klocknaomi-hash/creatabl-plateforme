"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Bell, PenSquare, Settings, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";
import { useAccess } from "@/hooks/useAccess";

import { NotificationsPopover } from "@/components/dashboard/notifications-popover";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/posts": "Posts",
  "/dashboard/compose": "Créer un post",
  "/dashboard/calendar": "Calendrier",
  "/dashboard/analytics": "Analytics",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Paramètres",
  "/dashboard/settings/connections": "Comptes connectés",
  "/dashboard/settings/workspace": "Espaces de travail",
  "/dashboard/equipe/projets": "Projets de l'équipe",
  "/dashboard/equipe/membres": "Membres de l'équipe",
  "/dashboard/agent-ia": "Agent IA",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const access = useAccess();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the best matching title (longest prefix match)
  const title =
    Object.entries(routeTitles)
      .filter(([route]) => pathname === route || pathname.startsWith(route + "/"))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard";

  const isMembresPage = pathname === "/dashboard/equipe/membres";
  const isProjetsPage = pathname === "/dashboard/equipe/projets";

  if (!mounted || isMembresPage || isProjetsPage) {
    return null;
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6 lg:px-8">
      {/* Page title */}
      <h1 className="text-base font-semibold truncate flex-1">{title}</h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Inviter un membre — visible for Business plan */}
        {access.team && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/equipe/membres?invite=true')}
            className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 gap-1.5 hidden sm:inline-flex h-9"
          >
            <UserPlus className="size-4" />
            <span>Inviter un membre</span>
          </Button>
        )}

        {/* New Post — full button on desktop */}
        <Button
          id="topbar-new-post-btn"
          size="sm"
          render={<Link href="/dashboard/compose" />}
          className="hidden sm:inline-flex"
        >
          <PenSquare />
          Créer un post
        </Button>

        {/* New Post — icon only on mobile */}
        <Button
          id="topbar-new-post-btn-mobile"
          size="icon-sm"
          variant="ghost"
          render={<Link href="/dashboard/compose" />}
          className="sm:hidden"
          aria-label="Nouveau post"
        >
          <PenSquare />
        </Button>

        {/* Organization Switcher */}
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/dashboard/settings/workspace"
          afterLeaveOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#7C3AED',
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: 'flex items-center shrink-0',
              organizationSwitcherTrigger:
                'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/70 text-xs font-semibold text-foreground transition-all max-w-[180px] sm:max-w-[220px] truncate',
              organizationPreviewAvatarBox: 'size-5 rounded-md shrink-0',
              organizationSwitcherTriggerIcon: 'size-3.5 text-muted-foreground shrink-0',
            },
          }}
        />

        {/* Notifications */}
        <NotificationsPopover />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Clerk user button */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7",
            },
          }}
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="Settings"
              labelIcon={<Settings className="size-4" />}
              href="/dashboard/settings"
            />
            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    </header>
  );
}

