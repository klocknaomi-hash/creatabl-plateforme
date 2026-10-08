"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Link2,
  CreditCard,
  Plus,
  FileText,
  Users,
  WandSparkles,
  Settings,
  Inbox,
  Image as ImageIcon,
  Palette,
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

import type React from "react";
import { CreditsMeter } from "@/components/dashboard/CreditsMeter";


type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
  activePrefix?: string;
  exclude?: string;
};

export function AppSidebar() {
  const pathname = usePathname();

  // Navigation du design system Creatabl.ia : création, publication, calendrier,
  // contenu et analytique, puis l'espace (équipe, organisation, réglages).
  // Sidebar finale du design system : Principal, Ressources, Espace, Compte.
  const navMain: NavItem[] = [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Agent IA", href: "/dashboard/agent-ia", icon: WandSparkles },
    { title: "Calendrier", href: "/dashboard/calendar", icon: CalendarDays },
    { title: "Publications", href: "/dashboard/posts", icon: FileText },
    { title: "Analytique", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  const navResources: NavItem[] = [
    { title: "Messages", href: "#messages", icon: Inbox, soon: true },
    { title: "Médiathèque", href: "/dashboard/mediatheque", icon: ImageIcon },
  ];

  // L'organisation se gère depuis la Top Bar et la page Équipe.
  const navSpace: NavItem[] = [
    { title: "Comptes connectés", href: "/dashboard/settings/connections", icon: Link2 },
    { title: "Ton de marque", href: "/dashboard/ton-de-marque", icon: Palette },
    { title: "Équipe", href: "/dashboard/equipe/membres", icon: Users, activePrefix: "/dashboard/equipe" },
  ];

  const navAccount: NavItem[] = [
    { title: "Abonnement", href: "/dashboard/billing", icon: CreditCard },
    { title: "Paramètres", href: "/dashboard/settings", icon: Settings, activePrefix: "/dashboard/settings", exclude: "/dashboard/settings/connections" },
  ];

  function isActive(item: NavItem) {
    if (item.soon) return false;
    if (item.href === "/dashboard") return pathname === "/dashboard";
    if (item.exclude && pathname.startsWith(item.exclude)) return false;
    return pathname.startsWith(item.activePrefix ?? item.href);
  }

  const renderItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          {item.soon ? (
            // Fonction pas encore disponible : elle garde sa place, avec un badge « Bientôt ».
            <SidebarMenuButton aria-disabled="true" tooltip={`${item.title} (bientôt)`} className="cursor-default opacity-100 aria-disabled:opacity-100">
              <item.icon />
              <span className="flex w-full items-center justify-between gap-2">
                <span>{item.title}</span>
                <span className="cr-badge cr-badge--violet cr-badge--plain" style={{ height: 20, padding: "0 8px", fontSize: 11 }}>Bientôt</span>
              </span>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              render={<Link href={item.href} aria-current={isActive(item) ? "page" : undefined} />}
              isActive={isActive(item)}
              tooltip={item.title}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          )}
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
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(navMain)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ressources</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(navResources)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Espace</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(navSpace)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(navAccount)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter className="px-3 py-2 space-y-2 group-data-[collapsible=icon]:px-1">
        <CreditsMeter />

      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
