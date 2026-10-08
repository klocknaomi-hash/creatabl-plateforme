import { AudienceActivityChart } from "./audience-activity-chart";
import { getEngagementData, getCachedAccounts, getDashboardStats } from "@/lib/dashboard-data";
import { auth } from "@clerk/nextjs/server";

// Panneau « Activité de l'audience » (7 derniers jours). Sans compte connecté,
// le panneau « Comptes connectés » invite déjà à en ajouter un : rien à afficher ici.
export async function AudienceActivity() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let data: Awaited<ReturnType<typeof getEngagementData>> = [];
  let hasAccounts = false;
  let hasPosts = false;
  try {
    const [engagementData, accounts, stats] = await Promise.all([
      getEngagementData(clerkId),
      getCachedAccounts(clerkId),
      getDashboardStats(clerkId),
    ]);
    data = engagementData;
    hasAccounts = (accounts || []).length > 0;
    hasPosts = Number(stats.totalPosts || 0) > 0;
  } catch (error) {
    console.error("AudienceActivity error:", error);
    return null;
  }

  if (!hasAccounts) return null;

  return (
    <section className="ap-panel" aria-labelledby="dash-activity">
      <div className="ap-panel-head">
        <div>
          <h2 id="dash-activity">Activité de l&apos;audience</h2>
          <p className="text-sm text-[#4B4B63]">Engagement quotidien sur tous vos réseaux</p>
        </div>
        <span className="cr-badge cr-badge--violet">7 derniers jours</span>
      </div>
      <div className="ap-panel-body">
        <AudienceActivityChart engagementData={data} hasAccounts={hasAccounts} hasPosts={hasPosts} />
      </div>
    </section>
  );
}
