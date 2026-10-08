"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, RefreshCcw, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, Badge, EmptyState, PageHeader, PlanGate, PostCard, StatCard, StatusBadge } from "@/components/ds"
import NetworkLogo from "@/components/ds/NetworkLogo"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { TrialBanner } from "@/components/dashboard/TrialBanner"
import { useConfirm } from "@/components/ds/confirm"

const DAY = 24 * 60 * 60 * 1000

function Section({ id, title, text, children }: { id: string; title: string; text?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4 rounded-[12px] border border-[#E6E4EE] bg-white p-6">
      <div>
        <h2 id={id} className="font-heading text-xl font-semibold text-[#14121F]">{title}</h2>
        {text && <p className="mt-1 text-sm text-[#4B4B63]">{text}</p>}
      </div>
      {children}
    </section>
  )
}

export function StatesGallery({ nowIso }: { nowIso: string }) {
  const now = new Date(nowIso)
  const at = (days: number, h: number, m = 0) => {
    const d = new Date(now.getTime() + days * DAY)
    d.setHours(h, m, 0, 0)
    return d
  }
  const confirm = useConfirm()
  const [publishing, setPublishing] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [autoPublish, setAutoPublish] = useState(true)
  const [alerts, setAlerts] = useState({ sent: true, week: true, fb: true, x: true, conn: true })
  const hide = (k: keyof typeof alerts) => setAlerts((a) => ({ ...a, [k]: false }))

  const trialStart = new Date(now.getTime() - 9 * DAY).toISOString()

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-6 p-4 md:p-6 lg:p-8">
      <PageHeader
        title="États de l'interface"
        description="Tous les états du design system, avec des données d'exemple. Les actions de cette page ne modifient pas votre compte."
        actions={<Badge tone="info">Données d&apos;exemple</Badge>}
      />

      <Section id="s-alerts" title="Alertes" text="Affichées sur le tableau de bord quand l'événement se produit.">
        <div className="grid gap-3">
          {alerts.sent && (
            <Alert tone="success" title="Publication envoyée" onDismiss={() => hide("sent")}>
              « Les coulisses de notre atelier » est en ligne sur Instagram et LinkedIn.
            </Alert>
          )}
          {alerts.week && (
            <Alert tone="info" title="12 posts programmés cette semaine" onDismiss={() => hide("week")}
              action={<Link href="/dashboard/calendar" className="cr-btn cr-btn--secondary cr-btn--sm"><CalendarDays size={16} aria-hidden="true" />Voir le calendrier</Link>}>
              Prochaine publication {at(1, 9, 30).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à 9 h 30.
            </Alert>
          )}
          {alerts.fb && (
            <Alert tone="success" title="Publication Facebook réussie" onDismiss={() => hide("fb")}>
              Votre post est visible sur la page Néonest.
            </Alert>
          )}
          {alerts.x && (
            <Alert tone="error" title="Échec de publication sur X"
              action={<Button size="sm" variant="outline" onClick={() => toast.success("Nouvelle tentative programmée (exemple)")}><RefreshCcw aria-hidden="true" />Réessayer</Button>}
              onDismiss={() => hide("x")}>
              Le texte dépasse 280 caractères. Raccourcissez-le puis réessayez.
            </Alert>
          )}
          {alerts.conn && (
            <Alert tone="warning" title="Mauvaise connexion"
              action={<Link href="/dashboard/settings/connections" className="cr-btn cr-btn--secondary cr-btn--sm">Reconnecter Facebook</Link>}
              onDismiss={() => hide("conn")}>
              L&apos;accès à Facebook a expiré : les posts programmés sur ce compte ne partiront pas.
            </Alert>
          )}
          {!Object.values(alerts).some(Boolean) && (
            <Button variant="outline" className="justify-self-start" onClick={() => setAlerts({ sent: true, week: true, fb: true, x: true, conn: true })}>
              Afficher de nouveau les alertes
            </Button>
          )}
        </div>
      </Section>

      <Section id="s-badges" title="Statuts" text="Badges de statut des publications.">
        <div className="flex flex-wrap gap-2">
          {["edited", "published", "scheduled", "pending", "failed", "draft", "ai"].map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section id="s-buttons" title="Boutons" text="Variantes et états. Survol et focus clavier sont visibles en passant dessus ou avec Tab.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primaire</Button>
          <Button variant="outline">Secondaire</Button>
          <Button variant="ghost">Fantôme</Button>
          <Button disabled>Désactivé</Button>
          <Button loading>Chargement</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            loading={publishing}
            onClick={() => {
              setPublishing(true)
              setTimeout(() => { setPublishing(false); toast.success("Publication envoyée (exemple)") }, 1800)
            }}
          >
            {!publishing && <Send aria-hidden="true" />}
            {publishing ? "Publication en cours…" : "Publier maintenant"}
          </Button>
          <Button
            variant="destructive-soft"
            disabled={deleted}
            onClick={async () => {
              const ok = await confirm({
                title: "Supprimer ce post ?",
                description: "Le post et ses programmations seront supprimés. Cette action est définitive.",
                confirmLabel: "Supprimer le post",
              })
              if (ok) { setDeleted(true); toast.success("Post supprimé (exemple)") }
            }}
          >
            <Trash2 aria-hidden="true" />
            {deleted ? "Post supprimé" : "Supprimer le post"}
          </Button>
          {deleted && <Button variant="ghost" onClick={() => setDeleted(false)}>Annuler</Button>}
          <Button variant="destructive">Confirmer la suppression</Button>
        </div>
      </Section>

      <Section id="s-nets" title="Network Tags" text="Sélection des comptes, connexion, reconnexion et réseaux à venir.">
        <div className="flex flex-wrap gap-2">
          <span className="cr-net" aria-pressed="true"><NetworkLogo name="instagram" size={18} />@neonest.studio<span className="cr-tick"><Check size={16} aria-hidden="true" /></span></span>
          <span className="cr-net"><NetworkLogo name="linkedin" size={18} />Néonest<Badge tone="success">Connecté</Badge></span>
          <Link href="/dashboard/settings/connections" className="cr-net is-error"><NetworkLogo name="facebook" size={18} />Reconnecter Facebook</Link>
          <span className="cr-net is-off"><NetworkLogo name="x" size={18} />Non connecté</span>
          <span className="cr-net is-off" aria-disabled="true"><NetworkLogo name="tiktok" size={18} />TikTok · bientôt</span>
          <span className="cr-net is-off" aria-disabled="true"><NetworkLogo name="youtube" size={18} />YouTube<Badge tone="violet" plain>Plan Pro</Badge></span>
          <span className="cr-net is-off" aria-disabled="true"><NetworkLogo name="pinterest" size={18} />Pinterest<Badge tone="violet" plain>Plan Business</Badge></span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="cr-net cr-net--sm"><NetworkLogo name="instagram" size={14} />Instagram</span>
          <span className="cr-net cr-net--sm is-error"><NetworkLogo name="facebook" size={14} />Erreur</span>
          <span className="cr-net cr-net--sm is-off"><NetworkLogo name="tiktok" size={14} />Déconnecté</span>
        </div>
      </Section>

      <Section id="s-posts" title="Post Cards" text="Un post en échec porte une ligne rouge, le message d'erreur et ses actions.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PostCard status="scheduled" platforms={["instagram", "facebook"]} date={at(1, 9, 30)} aiGenerated
            content="Nouvelle collection d'automne : trois pièces fabriquées à la main dans notre atelier de Nantes." />
          <PostCard status="published" platforms={["linkedin"]} date={at(-1, 12, 0)} footNote="1 240 vues"
            content="Ce que nous avons appris en lançant notre boutique en ligne il y a un an." />
          <PostCard status="failed" platforms={["twitter"]} date={at(-1, 18, 15)}
            errorMessage="texte trop long pour X (312 caractères sur 280)"
            content="Les coulisses de notre atelier : du croquis au produit fini, voici comment nous travaillons chaque jour avec nos artisans."
            actions={<span className="flex gap-2"><Button size="sm" variant="outline">Modifier</Button><Button size="sm">Réessayer</Button></span>} />
          <PostCard status="pending" platforms={["instagram"]} date={at(2, 11, 0)} footNote="en attente du client"
            content="Avant / après : la rénovation de la boutique en photos." />
          <PostCard status="draft" platforms={["facebook", "linkedin"]} footNote="Brouillon créé aujourd'hui"
            content="Idée : présenter l'équipe, une personne par semaine." />
          <PostCard status="edited" platforms={["instagram"]} date={at(3, 8, 0)}
            content="Offre de lancement : -15 % sur la première commande jusqu'à dimanche." />
        </div>
      </Section>

      <Section id="s-trial" title="Bannière d'essai" text="Calculée depuis la date d'inscription et la date de fin de l'essai.">
        <div className="grid gap-3">
          <TrialBanner demo now={now} trial={{ startedAt: trialStart, endsAt: new Date(now.getTime() + 5 * DAY).toISOString(), trialPlan: "business", selectedPlan: "pro" }} />
          <TrialBanner demo now={now} trial={{ startedAt: trialStart, endsAt: at(1, 23, 0).toISOString(), trialPlan: "business", selectedPlan: null, scheduledCount: 12 }} />
          <TrialBanner demo now={now} trial={{ startedAt: trialStart, endsAt: at(0, 23, 59).toISOString(), trialPlan: "business", selectedPlan: "business" }} />
        </div>
      </Section>

      <Section id="s-empty" title="États vides" text="Quand il n'y a encore rien à afficher.">
        <div className="grid gap-4 md:grid-cols-2">
          <EmptyState title="Aucun post programmé" text="Programmez vos prochaines publications ou laissez l'IA préparer votre semaine.">
            <Button onClick={() => toast.info("Sur le tableau de bord, ce bouton génère 5 brouillons pour la semaine prochaine.")}>Générer une semaine</Button>
          </EmptyState>
          <EmptyState illustration="chart" title="Pas encore de statistiques" text="Les chiffres apparaissent après vos premières publications." />
        </div>
        <div className="ap-stats ap-stats--3">
          <StatCard label="Portée" value="12 480" delta="+18 %" context="sur 30 jours" />
          <StatCard label="Taux d'engagement" value="4,2 %" delta="-0,3 pt" down context="sur 30 jours" />
          <StatCard label="Posts publiés" value="—" context="Pas encore de données" />
        </div>
      </Section>

      <Section id="s-plan" title="Fonctions Business" text="Visibles par tous, activables seulement avec le plan Business.">
        <div className="grid gap-3">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm"><strong className="font-semibold">Publication automatique</strong> · plan Business actif</span>
            <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
          </label>
          <label className="flex items-center justify-between gap-4 text-[#6B6780]">
            <span className="text-sm"><strong className="font-semibold">Validation client</strong> · plan Pro : désactivé</span>
            <Switch disabled checked={false} />
          </label>
        </div>
        <PlanGate feature="La validation client" plan="Business" description="Envoyez vos posts à votre client pour validation avant publication." />
      </Section>
    </div>
  )
}
