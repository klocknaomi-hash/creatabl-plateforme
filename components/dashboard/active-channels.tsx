import Link from "next/link";
import { Plus } from "lucide-react";
import { getCachedAccounts, getCachedUserSettings } from "@/lib/dashboard-data";
import { getTranslation } from "@/lib/i18n";
import NetworkLogo, { toNetwork } from "@/components/ds/NetworkLogo";
import { EmptyState } from "@/components/ds";

import { auth } from "@clerk/nextjs/server";

interface ActiveChannelsProps {
  accounts: any[];
  t: any;
}

export async function ActiveChannels() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const [accounts, settings] = await Promise.all([
    getCachedAccounts(clerkId),
    getCachedUserSettings(clerkId),
  ]);

  const t = getTranslation(settings?.language || "fr");

  return <ActiveChannelsView accounts={accounts || []} t={t} />;
}

// Panneau « Comptes connectés » du tableau de bord (DashboardPage du design system).
export function ActiveChannelsView({ accounts }: ActiveChannelsProps) {
  return (
    <section className="ap-panel" aria-labelledby="dash-accounts">
      <div className="ap-panel-head">
        <h2 id="dash-accounts">Comptes connectés</h2>
        <span className="cr-badge cr-badge--plain">{accounts.length}</span>
      </div>
      {accounts.length === 0 ? (
        <EmptyState
          bordered={false}
          illustration="posts"
          title="Aucun compte connecté"
          text="Connectez au moins un réseau pour programmer vos publications."
        >
          <Link href="/dashboard/settings/connections" className="cr-btn cr-btn--secondary">
            <Plus size={18} aria-hidden="true" />
            Connecter un compte
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="ap-panel-body flex flex-wrap gap-2">
            {accounts.map((acc: any) => {
              const net = toNetwork(String(acc.platform).toLowerCase());
              return (
                <Link key={acc.id} href="/dashboard/settings/connections" className="cr-net cr-net--sm" title={acc.platform}>
                  {net && <NetworkLogo name={net} size={14} />}
                  <span className="max-w-[160px] truncate">@{acc.username}</span>
                </Link>
              );
            })}
          </div>
          <div className="ap-panel-foot">
            <Link href="/dashboard/settings/connections" className="cr-link">
              <Plus size={16} aria-hidden="true" />
              Gérer les comptes
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
