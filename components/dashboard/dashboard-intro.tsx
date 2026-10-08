import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { Check } from "lucide-react";
import { db } from "@/lib/db";
import { postPlatformResults, posts, socialAccounts, users } from "@/lib/db/schema";
import { Alert, Badge } from "@/components/ds";
import NetworkLogo from "@/components/ds/NetworkLogo";

const PLAN_NAMES: Record<string, string> = { free: "Free", starter: "Starter", pro: "Pro", business: "Business", agency: "Business" };
const NET_NAMES: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", twitter: "X", tiktok: "TikTok", youtube: "YouTube", pinterest: "Pinterest" };
const DAY = 24 * 60 * 60 * 1000;

function fmtDay(d: Date) {
  const s = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return `${s} à ${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}`;
}

// En-tête du tableau de bord : accueil, organisation, plan, alertes et « Bien démarrer ».
// Tout est calculé depuis les données du compte.
export async function DashboardIntro() {
  const { userId, orgId } = await auth();
  if (!userId) return null;

  const [clerk, dbUser] = await Promise.all([
    currentUser().catch(() => null),
    db.query.users.findFirst({ where: eq(users.clerkId, userId) }).catch(() => undefined),
  ]);

  let orgName: string | null = null;
  let hasOrganization = !!orgId;
  try {
    const client = await clerkClient();
    if (orgId) orgName = (await client.organizations.getOrganization({ organizationId: orgId })).name;
    if (!hasOrganization) {
      const list = await client.users.getOrganizationMembershipList({ userId, limit: 1 });
      hasOrganization = (list.totalCount ?? list.data.length) > 0;
    }
  } catch (e) {
    console.error("[dashboard] organisation lookup failed:", e);
  }

  const now = new Date();
  let accounts: { id: string; platform: string; username: string | null; expiresAt: Date | null; refreshToken: string | null }[] = [];
  let weekScheduled: { scheduledAt: Date | null }[] = [];
  let recentFailures: { postId: string; platform: string; errorMessage: string | null }[] = [];
  let recentSuccess: { platform: string }[] = [];
  if (dbUser) {
    try {
      const owner = orgId ? eq(posts.organizationId, orgId) : eq(posts.userId, dbUser.id);
      [accounts, weekScheduled] = await Promise.all([
        db
          .select({ id: socialAccounts.id, platform: socialAccounts.platform, username: socialAccounts.username, expiresAt: socialAccounts.expiresAt, refreshToken: socialAccounts.refreshToken })
          .from(socialAccounts)
          .where(orgId ? eq(socialAccounts.organizationId, orgId) : eq(socialAccounts.userId, dbUser.id)),
        db
          .select({ scheduledAt: posts.scheduledAt })
          .from(posts)
          .where(and(owner, eq(posts.status, "scheduled"), gte(posts.scheduledAt, now), lte(posts.scheduledAt, new Date(now.getTime() + 7 * DAY))))
          .orderBy(posts.scheduledAt),
      ]);
      const results = await db
        .select({ postId: postPlatformResults.postId, platform: postPlatformResults.platform, status: postPlatformResults.status, errorMessage: postPlatformResults.errorMessage, publishedAt: postPlatformResults.publishedAt })
        .from(postPlatformResults)
        .innerJoin(posts, eq(posts.id, postPlatformResults.postId))
        .where(and(owner, inArray(postPlatformResults.status, ["failed", "success"]), gte(posts.createdAt, new Date(now.getTime() - 14 * DAY))))
        .orderBy(desc(posts.createdAt))
        .limit(20);
      recentFailures = results.filter((r) => r.status === "failed").slice(0, 2);
      recentSuccess = results.filter((r) => r.status === "success" && r.publishedAt && now.getTime() - new Date(r.publishedAt).getTime() < DAY);
    } catch (e) {
      console.error("[dashboard] intro data failed:", e);
    }
  }

  const firstName = clerk?.firstName?.trim();
  const plan = PLAN_NAMES[(dbUser?.plan || dbUser?.selectedPlan || "free").toLowerCase()] ?? "Free";
  const trialEnds = dbUser?.trialEndsAt ? new Date(dbUser.trialEndsAt) : null;
  const onTrial = !!trialEnds && trialEnds > now && !dbUser?.isSubscribed && plan !== "Free";
  const expired = accounts.filter((a) => a.expiresAt && new Date(a.expiresAt) < now && !a.refreshToken);

  const steps = [
    { id: "org", title: "Créer votre organisation", done: hasOrganization, text: hasOrganization ? `Espace ${orgName ?? "créé"}.` : "Regroupez vos comptes, vos posts et votre équipe." },
    { id: "accounts", title: "Connecter vos réseaux", done: accounts.length > 0, text: accounts.length > 0 ? `${accounts.length} compte${accounts.length > 1 ? "s" : ""} connecté${accounts.length > 1 ? "s" : ""}.` : "Choisissez où publier. Vous pourrez en ajouter plus tard." },
    { id: "style", title: "Choisir votre style d'écriture", done: !!dbUser?.writingTone, text: "Professionnel, inspirant, direct ou décontracté : l'Agent IA s'y adapte." },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="grid gap-6">
      <header className="ap-hello flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1>{firstName ? `Bonjour ${firstName}` : "Bonjour"}</h1>
          <p>
            {orgName ? <>Organisation <strong className="font-semibold text-[#14121F]">{orgName}</strong> · </> : <>Espace personnel · </>}
            Voici vos publications à venir, vos brouillons et vos résultats.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="violet" plain>Plan {plan}</Badge>
          {onTrial && trialEnds && (
            <Badge tone="info">Essai jusqu&apos;au {trialEnds.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</Badge>
          )}
        </div>
      </header>

      {(recentSuccess.length > 0 || weekScheduled.length > 0 || recentFailures.length > 0 || expired.length > 0) && (
        <div className="grid gap-3">
          {recentFailures.map((f) => (
            <Alert
              key={`${f.postId}-${f.platform}`}
              tone="error"
              title={`Échec de publication sur ${NET_NAMES[f.platform] ?? f.platform}`}
              action={<Link href={`/dashboard/posts/${f.postId}`} className="cr-btn cr-btn--secondary cr-btn--sm">Voir le post</Link>}
            >
              {f.errorMessage || "Le réseau a refusé la publication. Vérifiez le texte et les médias, puis relancez."}
            </Alert>
          ))}
          {expired.map((a) => (
            <Alert
              key={a.id}
              tone="warning"
              title={`Connexion ${NET_NAMES[a.platform] ?? a.platform} à renouveler`}
              action={<Link href={`/api/oauth/${a.platform}`} className="cr-btn cr-btn--secondary cr-btn--sm">Reconnecter</Link>}
            >
              L&apos;accès de @{a.username ?? a.platform} a expiré : reconnectez le compte pour continuer à publier.
            </Alert>
          ))}
          {recentSuccess.length > 0 && (
            <Alert tone="success" title="Publication envoyée">
              Votre post est en ligne sur {Array.from(new Set(recentSuccess.map((r) => NET_NAMES[r.platform] ?? r.platform))).join(" et ")}.
            </Alert>
          )}
          {weekScheduled.length > 0 && weekScheduled[0].scheduledAt && (
            <Alert tone="info" title={`${weekScheduled.length} post${weekScheduled.length > 1 ? "s" : ""} programmé${weekScheduled.length > 1 ? "s" : ""} cette semaine`}>
              Le prochain part {fmtDay(new Date(weekScheduled[0].scheduledAt))}.
            </Alert>
          )}
        </div>
      )}

      {doneCount < steps.length && (
        <section className="ap-onboard" aria-labelledby="onboard-title">
          <div className="ap-onboard-head">
            <div>
              <h2 id="onboard-title" className="font-heading text-xl font-semibold text-[#14121F]">Bien démarrer</h2>
              <p className="text-sm text-[#4B4B63]">Étape {Math.min(doneCount + 1, 3)} sur 3 · {doneCount} terminée{doneCount > 1 ? "s" : ""}</p>
            </div>
            <div className="cr-bar" style={{ width: 200 }} role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={3} aria-label="Progression">
              <span style={{ width: `${Math.round((doneCount / 3) * 100)}%` }} />
            </div>
          </div>
          <div className="ap-steps">
            {steps.map((s) => (
              <div key={s.id} className={`ap-task${s.done ? " done" : ""}`}>
                <span className="h">
                  <span className="tick">{s.done && <Check size={14} aria-hidden="true" />}</span>
                  {s.title}
                </span>
                <p>{s.text}</p>
                {!s.done && s.id === "org" && (
                  <Link className="cr-link" href="/dashboard/settings/workspace">Créer mon organisation</Link>
                )}
                {!s.done && s.id === "accounts" && (
                  <div className="flex flex-wrap gap-1.5">
                    {(["instagram", "facebook", "linkedin", "twitter"] as const).map((p) => (
                      <Link key={p} href={`/api/oauth/${p}`} className="cr-net cr-net--sm">
                        <NetworkLogo name={p === "twitter" ? "x" : p} size={14} />
                        {NET_NAMES[p]}
                      </Link>
                    ))}
                    <span className="cr-net cr-net--sm is-off" aria-disabled="true">
                      <NetworkLogo name="tiktok" size={14} />
                      TikTok · bientôt
                    </span>
                  </div>
                )}
                {!s.done && s.id === "style" && (
                  <Link className="cr-link" href="/dashboard/ton-de-marque">Choisir mon style</Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
