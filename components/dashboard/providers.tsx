"use client";

import { SettingsProvider } from "@/lib/settings-context";
import { SidebarProvider } from "@/components/ui/sidebar";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </SettingsProvider>
  );
}
