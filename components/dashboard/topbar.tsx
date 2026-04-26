"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, PenSquare, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/posts": "Posts",
  "/dashboard/compose": "Compose",
  "/dashboard/calendar": "Calendar",
  "/dashboard/auto-reply": "Auto-Reply",
  "/dashboard/media": "Media Library",
  "/dashboard/analytics": "Analytics",
  "/dashboard/accounts": "Connected Accounts",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the best matching title (longest prefix match)
  const title =
    Object.entries(routeTitles)
      .filter(([route]) => pathname === route || pathname.startsWith(route + "/"))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard";

  if (!mounted) {
    return (
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6 lg:px-8">
        <div className="flex-1" />
      </header>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:px-6 lg:px-8">
      {/* Page title */}
      <h1 className="text-base font-semibold truncate flex-1">{title}</h1>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* New Post — full button on desktop */}
        <Button
          id="topbar-new-post-btn"
          size="sm"
          render={<Link href="/dashboard/compose" />}
          className="hidden sm:inline-flex"
        >
          <PenSquare />
          New Post
        </Button>

        {/* New Post — icon only on mobile */}
        <Button
          id="topbar-new-post-btn-mobile"
          size="icon-sm"
          variant="ghost"
          render={<Link href="/dashboard/compose" />}
          className="sm:hidden"
          aria-label="New Post"
        >
          <PenSquare />
        </Button>

        {/* Notification bell (placeholder) */}
        <button
          id="topbar-notification-bell"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          aria-label="Notifications"
        >
          <Bell />
        </button>

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

