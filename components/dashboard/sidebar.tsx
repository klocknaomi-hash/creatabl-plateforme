"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  PenLine,
  CalendarDays,
  MessageSquareReply,
  ImageIcon,
  BarChart2,
  Link2,
  CreditCard,
  PenSquare,
  FileText,
  Settings
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

const navMain = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Compose", href: "/dashboard/compose", icon: PenLine },
  { title: "Posts", href: "/dashboard/posts", icon: FileText },
  { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
];

const navAutomation = [
  { title: "Auto-Reply", href: "/dashboard/auto-reply", icon: MessageSquareReply },
];

const navContent = [
  { title: "Media Library", href: "/dashboard/media", icon: ImageIcon },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
];

const navSettings = [
  { title: "Connected Accounts", href: "/dashboard/accounts", icon: Link2 },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

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
          <span className="group-data-[collapsible=icon]:hidden">New Post</span>
        </Button>
      </div>

      <SidebarSeparator />

      {/* ── Navigation ── */}
      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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

        {/* Automation */}
        <SidebarGroup>
          <SidebarGroupLabel>Automation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navAutomation.map((item) => (
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
          <SidebarGroupLabel>Content</SidebarGroupLabel>
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

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
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
      <SidebarFooter className="px-2 py-3">
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
                <span className="truncate text-sm font-medium leading-tight">
                  {user?.fullName ?? user?.username ?? "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ?? ""}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] group-data-[collapsible=icon]:hidden"
              >
                Free
              </Badge>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
