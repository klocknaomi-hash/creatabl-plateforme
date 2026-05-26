"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  PenLine,
  CalendarDays,
  ImageIcon,
  BarChart2,
  Link2,
  CreditCard,
  PenSquare,
  FileText,
  Settings,
  Clock,
  FolderKanban,
  Users,
  Bot
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
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { useAccess } from "@/hooks/useAccess";


export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { language } = useSettings();
  const t = getTranslation(language);
  const access = useAccess();

  const navMain = [
    { title: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { title: t.compose, href: "/dashboard/compose", icon: PenLine },
    { title: t.posts, href: "/dashboard/posts", icon: FileText },
    { title: t.calendar, href: "/dashboard/calendar", icon: CalendarDays },
  ];



  const navContent = [
    { title: t.analytics, href: "/dashboard/analytics", icon: BarChart2 },
  ];

  const navSettings = [
    { title: t.accounts, href: "/dashboard/settings/connections", icon: Link2 },
    { title: t.billing, href: "/dashboard/billing", icon: CreditCard },
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
        <div className="group-data-[collapsible=icon]:hidden">
          <WorkspaceSwitcher />
        </div>
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
                    <item.icon />
                    <span>{item.title}</span>
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

        {/* Outils IA */}
        {access.aiAdvanced && (
          <SidebarGroup>
            <SidebarGroupLabel>Outils IA</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard/agent-ia" />}
                    isActive={isActive("/dashboard/agent-ia")}
                    tooltip="Agent IA"
                  >
                    <Bot className="size-4 shrink-0" />
                    <span className="flex items-center justify-between w-full">
                      <span>Agent IA</span>
                      <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary tracking-wider uppercase">
                        NOUVEAU
                      </span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

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
      <SidebarFooter className="px-4 py-4 space-y-4 group-data-[collapsible=icon]:px-1">
        {/* Trial Info */}
        {(() => {
          const email = user?.emailAddresses[0]?.emailAddress ?? '';
          const isTestOrNaomi = email === 'klock.naomi@gmail.com' || email.endsWith('-test@creatabl-ia.com');
          if (isTestOrNaomi) return null;

          let trialEndsAt = user?.publicMetadata?.trialEndsAt as string | undefined;
          
          // Fallback to 7 days from creation if trialEndsAt is missing
          if (!trialEndsAt && user?.createdAt) {
            const createdAt = new Date(user.createdAt);
            const sevenDaysLater = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
            trialEndsAt = sevenDaysLater.toISOString();
          }

          if (!trialEndsAt) return null;
          
          const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (isNaN(daysLeft) || daysLeft <= 0) return null;
          
          return (
            <div className="bg-primary/5 rounded-xl p-4 space-y-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-3 text-primary">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <Clock size={16} />
                </div>
                <span className="text-xs font-bold leading-tight">
                  Ton essai gratuit termine dans {daysLeft} jour{daysLeft > 1 ? "s" : ""}
                </span>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 h-auto"
                render={<Link href="https://creatabl-ia.com/tarifs" />}
              >
                Mettre à niveau
              </Button>
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
