"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart2,
  Link2,
  CreditCard,
  PenSquare,
  FileText,
  Clock,
  FolderKanban,
  Users,
  Building2,
  Bot,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSettings } from "@/lib/settings-context";
import { getTranslation } from "@/lib/i18n";
import { useAccess } from "@/hooks/useAccess";
import { isNaomiOrTest } from "@/lib/plans";
import { useEffect, useState } from "react";


export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { language } = useSettings();
  const t = getTranslation(language);
  const access = useAccess();

  // Workspace name from localStorage (set by workspace page)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const name = localStorage.getItem('current_workspace_name');
      setWorkspaceName(name);
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);

  const navMain: { title: string; href: string; icon: any; badge?: string }[] = [
    { title: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { title: t.compose, href: "/dashboard/compose", icon: PenSquare },
    { title: "Agent IA", href: "/dashboard/agent-ia", icon: Bot },
    { title: t.posts, href: "/dashboard/posts", icon: FileText },
    { title: t.calendar, href: "/dashboard/calendar", icon: CalendarDays },
  ];

  const navContent = [
    { title: t.analytics, href: "/dashboard/analytics", icon: BarChart2 },
  ];

  const navSettings = [
    { title: t.accounts, href: "/dashboard/settings/connections", icon: Link2 },
    { title: t.billing, href: "/dashboard/billing", icon: CreditCard },
    ...(access.multiAccounts
      ? [{ title: "Workspace", href: "/dashboard/settings/workspace", icon: Building2 }]
      : []),
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon">
      {/* ── Logo ── */}
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 overflow-hidden rounded-md py-1"
        >
          {/* Logo mark — always visible */}
          <Image
            src="/logo.svg"
            alt="Creatabl logo"
            width={28}
            height={28}
            className="size-7 shrink-0"
            priority
          />
          {/* Brand name — hidden when sidebar is icon-only */}
          <span className="flex items-baseline gap-0 leading-none group-data-[collapsible=icon]:hidden">
            <span className="text-[17px] font-semibold tracking-tight">
              Creatabl.
            </span>
            <span
              className="text-[17px] font-normal italic text-primary"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ia
            </span>
          </span>
        </Link>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      {/* ── New Post CTA ── */}
      <div className="px-2 pb-2 group-data-[collapsible=icon]:px-1">
        <Button
          id="sidebar-new-post-btn"
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
          render={<Link href="/dashboard/compose" />}
          size="sm"
        >
          <PenSquare className="size-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">{t.newPost}</span>
        </Button>
      </div>

      <SidebarSeparator />

      {/* ── Navigation ── */}
      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {'badge' in item ? (
                      <span className="flex items-center justify-between w-full">
                        <span>{item.title}</span>
                        <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary tracking-wider uppercase">
                          {item.badge}
                        </span>
                      </span>
                    ) : (
                      <span>{item.title}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content */}
        <SidebarGroup>
          <SidebarGroupLabel>Contenu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navContent.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {/* Team navigation section */}
        {access.team && (
          <SidebarGroup>
            <SidebarGroupLabel>Équipe</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/equipe/projets" />}
                    isActive={isActive("/dashboard/equipe/projets")}
                    tooltip="Projets"
                  >
                    <FolderKanban />
                    <span>Projets</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/equipe/membres" />}
                    isActive={isActive("/dashboard/equipe/membres")}
                    tooltip="Membres"
                  >
                    <Users />
                    <span>Membres</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navSettings.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter className="px-3 py-2 space-y-2 group-data-[collapsible=icon]:px-1">
        {/* Trial Info */}
        {(() => {
          const email = user?.emailAddresses[0]?.emailAddress ?? '';
          const currentPlan = (user?.publicMetadata?.plan as string) || 'starter';
          
          if (currentPlan === 'free' || isNaomiOrTest(email)) return null;
          
          let daysLeft = 14;
          let showTrial = true;
          
          let trialEndsAt = user?.publicMetadata?.trialEndsAt as string | undefined;
          if (!trialEndsAt && user?.createdAt) {
            const createdAt = new Date(user.createdAt);
            const fourteenDaysLater = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
            trialEndsAt = fourteenDaysLater.toISOString();
          }
          if (trialEndsAt) {
            const calculatedDays = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (!isNaN(calculatedDays) && calculatedDays > 0) {
              daysLeft = calculatedDays;
            } else {
              showTrial = false;
            }
          } else {
            showTrial = false;
          }

          if (!showTrial) return null;
          
          const progressPercentage = Math.max(0, Math.min(100, Math.round(((14 - daysLeft) / 14) * 100)));

          return (
            <div className="bg-[#534AB7]/5 border border-[#534AB7]/10 rounded-2xl p-4 space-y-2 group-data-[collapsible=icon]:hidden">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-[#534AB7] leading-none">
                  Essai Business
                </span>
                <span className="text-[11px] text-gray-500 font-semibold mt-1">
                  {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-2 w-full bg-purple-100/60 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-[#534AB7] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          );
        })()}

        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex w-full items-center gap-2.5 overflow-hidden rounded-md p-1.5",
                "group-data-[collapsible=icon]:justify-center"
              )}
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-7 shrink-0",
                  },
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium leading-tight text-foreground">
                  {user?.fullName ?? user?.username ?? "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ?? ""}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
