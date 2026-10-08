"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Link2,
  CreditCard,
  Plus,
  FileText,
  FolderKanban,
  Users,
  Building2,
  WandSparkles,
  Settings,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { useAccess } from "@/hooks/useAccess";
import { isNaomiOrTest } from "@/lib/plans";
import type React from "react";
import { CreditsMeter } from "@/components/dashboard/CreditsMeter";


type NavItem = { title: string; href: string; icon: React.ComponentType<{ className?: string }> };

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const access = useAccess();

  // Navigation du design system Creatabl.ia : création, publication, calendrier,
  // contenu et analytique, puis l'espace (équipe, organisation, réglages).
  const navMain: NavItem[] = [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Agent IA", href: "/dashboard/agent-ia", icon: WandSparkles },
    { title: "Calendrier", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "Publications", href: "/dashboard/posts", icon: FileText },
    { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  const navTeam: NavItem[] = [
    { title: "Projets", href: "/dashboard/equipe/projets", icon: FolderKanban },
    { title: "Membres", href: "/dashboard/equipe/membres", icon: Users },
  ];

  const navSpace: NavItem[] = [
    { title: "Comptes connectés", href: "/dashboard/settings/connections", icon: Link2 },
    ...(access.multiAccounts
      ? [{ title: "Organisation", href: "/dashboard/settings/workspace", icon: Building2 }]
      : []),
    { title: "Abonnement", href: "/dashboard/billing", icon: CreditCard },
    { title: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/settings") return pathname === "/dashboard/settings";
    return pathname.startsWith(href);
  }

  const renderItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            render={<Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} />}
            isActive={isActive(item.href)}
            tooltip={item.title}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      {/* ── Logo ── */}
      <SidebarHeader className="h-16 flex flex-row items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 overflow-hidden rounded-md py-1"
        >
          {/* Logo mark — always visible */}
          <Image
            src="/logo.png"
            alt="Creatabl logo"
            width={28}
            height={28}
            className="size-7 shrink-0"
            priority
          />
          {/* Brand name — hidden when sidebar is icon-only */}
          <span className="flex items-baseline gap-0 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-[18px] font-semibold tracking-[-0.01em] text-[#14121F]">
              Creatabl.
            </span>
            <span
              className="text-[18px] font-medium italic text-[#7225E3]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ia
            </span>
          </span>
        </Link>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      {/* ── New Post CTA ── */}
      <div className="px-3 pb-3 group-data-[collapsible=icon]:px-1">
        <Button
          id="sidebar-new-post-btn"
          className="h-11 w-full justify-center gap-2 bg-[image:var(--gradient-cta)] text-sm shadow-sm hover:bg-[#7225E3] hover:bg-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
          render={<Link href="/dashboard/compose" />}
        >
          <Plus className="size-[18px] shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Créer un post</span>
        </Button>
      </div>

      {/* ── Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>{renderItems(navMain)}</SidebarGroupContent>
        </SidebarGroup>

        {access.team && (
          <SidebarGroup>
            <SidebarGroupLabel>Équipe</SidebarGroupLabel>
            <SidebarGroupContent>{renderItems(navTeam)}</SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Espace</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(navSpace)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter className="px-3 py-2 space-y-2 group-data-[collapsible=icon]:px-1">
        {/* Trial Info */}
        {(() => {
          const email = user?.emailAddresses[0]?.emailAddress ?? '';
          const currentPlan = (user?.publicMetadata?.plan as string) || 'starter';
          
          if (currentPlan === 'free' || user?.publicMetadata?.isSubscribed || user?.publicMetadata?.subscriptionStatus === 'active' || isNaomiOrTest(email)) return null;
          
          let daysLeft = 14;
          let showTrial = true;
          
          let trialEndsAt = user?.publicMetadata?.trialEndsAt as string | undefined;
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
            <div className="bg-[#7225E3]/5 border border-[#7225E3]/10 rounded-2xl p-4 space-y-2 group-data-[collapsible=icon]:hidden">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-[#7225E3] leading-none">
                  Essai Business
                </span>
                <span className="text-[11px] text-gray-500 font-semibold mt-1">
                  {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-2 w-full bg-purple-100/60 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-[#7225E3] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          );
        })()}

        <CreditsMeter />

      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
