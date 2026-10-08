"use client";

import { SettingsProvider } from "@/lib/settings-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ConfirmProvider } from "@/components/ds/confirm";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ConfirmProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ConfirmProvider>
    </SettingsProvider>
  );
}
