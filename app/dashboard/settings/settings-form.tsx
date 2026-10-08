"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Settings2, 
  Save,
  Loader2,
  Plus
} from "lucide-react";
import { saveSettingsAction } from "./actions";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  initialSettings: any;
  user: any;
  hasData?: boolean;
  isBusiness?: boolean;
}

const AUTOMATIONS = [
  { id: "autoPublish", label: "Publication automatique", desc: "Les posts validés partent seuls à l'heure prévue, sans confirmation." },
  { id: "enableAutoReplies", label: "Réponses automatiques aux commentaires", desc: "L'IA propose et publie des réponses selon vos règles." },
  { id: "clientApproval", label: "Validation par un client", desc: "Chaque post passe « À valider » avant de pouvoir être programmé." },
];

export function SettingsForm({ initialSettings, user, hasData, isBusiness = false }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await saveSettingsAction(settings);
      if (result.success) {
        toast.success("Paramètres enregistrés avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Impossible d'enregistrer les paramètres");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      window.location.href = "/api/settings/export";
      toast.success("Export des données lancé");
    } catch (error) {
      toast.error("Impossible d'exporter les données");
    } finally {
      setTimeout(() => setExporting(false), 2000);
    }
  };

  const emailEnabled = settings.emailNotifications;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Paramètres
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Gérez vos préférences de notification et les configurations de l'application.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="w-full sm:w-auto gap-2 h-10 px-6 font-semibold text-xs shadow-lg transition-all active:scale-95 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      <div className="grid gap-8 pb-20">
        {/* NOTIFICATIONS SECTION */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-primary/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Bell className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xs font-bold text-[#6B6780]">Notifications</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border border-border/20">
              <div className="space-y-1">
                <Label className="text-sm font-semibold leading-none">Notifications par email</Label>
                <p className="text-sm text-muted-foreground font-medium">Recevez des mises à jour importantes sur votre compte et la plateforme par email.</p>
              </div>
              <Switch 
                checked={settings.emailNotifications} 
                onCheckedChange={() => handleToggle('emailNotifications')} 
                className="scale-110"
              />
            </div>

            <div className={cn(
              "space-y-6 pt-4 transition-all duration-300",
              !emailEnabled && "opacity-40 grayscale pointer-events-none"
            )}>
              <div className="flex items-center gap-3 ml-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs font-semibold text-[#6B6780] whitespace-nowrap">Abonnements liés</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: 'notifyNewComments', label: 'Nouveaux commentaires', desc: 'Alertes pour les interactions sur les posts' },
                  { id: 'notifyNewFollowers', label: 'Nouveaux abonnés', desc: 'Alertes de croissance sur vos comptes' },
                  { id: 'notifyPostPerformance', label: 'Performance des posts', desc: 'Résumés de l\'engagement et du reach' },
                  { id: 'notifyScheduledPosts', label: 'Rappels de programmation', desc: 'Alertes avant que les posts ne soient publiés' },
                ].map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border transition-colors",
                      emailEnabled ? "bg-card border-border/40 hover:bg-muted/10" : "bg-muted/5 border-border/20"
                    )}
                  >
                    <div className="space-y-1">
                      <Label htmlFor={item.id} className="text-sm font-semibold cursor-pointer">{item.label}</Label>
                      <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                    <Switch 
                      id={item.id}
                      checked={emailEnabled && settings[item.id]} 
                      onCheckedChange={() => handleToggle(item.id)} 
                      disabled={!emailEnabled}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AUTOMATISATIONS (BUSINESS) */}
        <section className="ap-panel" aria-labelledby="states-title">
          <div className="ap-panel-head">
            <div>
              <h2 id="states-title">États de l&apos;interface</h2>
              <p className="text-sm text-[#4B4B63]">Alertes, statuts, boutons et Post Cards avec des données d&apos;exemple.</p>
            </div>
            <Link href="/dashboard/etats" className="cr-btn cr-btn--secondary cr-btn--sm">Voir les états</Link>
          </div>
        </section>

        <section className="ap-panel" aria-labelledby="automations-title">
          <div className="ap-panel-head">
            <div>
              <h2 id="automations-title">Automatisations</h2>
              <p className="text-sm text-[#4B4B63]">Réglages avancés pour les équipes et les agences.</p>
            </div>
            <span className="cr-badge cr-badge--violet cr-badge--plain">Plan Business</span>
          </div>
          <div className="ap-panel-body grid gap-3">
            {!isBusiness && (
              <div className="cr-alert cr-alert--info" role="status">
                <div className="min-w-0 flex-1">
                  <strong>Disponible avec le plan Business</strong>
                  <p>Passez au plan Business pour automatiser la publication, les réponses et la validation client.</p>
                </div>
                <Link href="/dashboard/billing" className="cr-btn cr-btn--secondary cr-btn--sm self-center">Voir les plans</Link>
              </div>
            )}
            {AUTOMATIONS.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-[12px] border border-[#E8E6F0] px-4 py-3">
                <div className="space-y-0.5">
                  <Label htmlFor={item.id} className={cn("text-sm font-semibold", !isBusiness && "text-[#6B6780]")}>{item.label}</Label>
                  <p className="text-sm text-[#4B4B63]">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={isBusiness && !!settings[item.id]}
                  onCheckedChange={() => handleToggle(item.id)}
                  disabled={!isBusiness}
                  aria-label={item.label}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PREFERENCES SECTION */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-primary/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Settings2 className="size-4 text-primary" />
              </div>
              <CardTitle className="text-xs font-bold text-[#6B6780]">Préférences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-12">
            {/* Timezone */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Fuseau horaire</Label>
                <p className="text-sm text-muted-foreground font-medium">Utilisé pour la programmation des posts et les rapports d'analytics</p>
              </div>
              <Select items={{ UTC: "UTC (temps universel)", "Europe/Paris": "Europe/Paris (heure de Paris)", "America/New_York": "EST (heure de New York)", "Europe/London": "GMT (heure de Londres)", "Asia/Tokyo": "JST (heure de Tokyo)" }} value={settings.timezone} onValueChange={(v) => handleSelect('timezone', v)}>
                <SelectTrigger className="max-w-md h-11 bg-white border-[#878399] rounded-[12px] px-4 text-sm">
                  <SelectValue placeholder="Sélectionner un fuseau horaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (temps universel)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (heure de Paris)</SelectItem>
                  <SelectItem value="America/New_York">EST (heure de New York)</SelectItem>
                  <SelectItem value="Europe/London">GMT (heure de Londres)</SelectItem>
                  <SelectItem value="Asia/Tokyo">JST (heure de Tokyo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language & Locale */}
            <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-border/40">
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Langue</Label>
                <Select items={{ en: "English (US)", es: "Español", fr: "Français" }} value={settings.language} onValueChange={(v) => handleSelect('language', v)}>
                  <SelectTrigger className="h-11 bg-white border-[#878399] rounded-[12px] px-4 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Région</Label>
                <Select items={{ US: "États-Unis", FR: "France", UK: "Royaume-Uni", ES: "Espagne" }} value={settings.locale} onValueChange={(v) => handleSelect('locale', v)}>
                  <SelectTrigger className="h-11 bg-white border-[#878399] rounded-[12px] px-4 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">États-Unis</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="UK">Royaume-Uni</SelectItem>
                    <SelectItem value="ES">Espagne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DATA MANAGEMENT SECTION */}
        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-destructive/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2.5 rounded-xl">
                <Save className="size-4 text-destructive" />
              </div>
              <CardTitle className="text-xs font-bold text-[#6B6780]">Gestion des données</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-destructive/5 rounded-2xl border border-destructive/10">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-destructive">Exporter vos données personnelles</Label>
                <p className="text-xs text-muted-foreground font-medium max-w-md">Téléchargez une archive complète de vos posts, analytics et paramètres de compte au format JSON.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!hasData || exporting}
                onClick={handleExport}
                className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-semibold px-5"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Exporter les données"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
