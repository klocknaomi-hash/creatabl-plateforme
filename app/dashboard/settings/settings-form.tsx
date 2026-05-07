"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { 
  Bell, 
  Settings2, 
  Save,
  Loader2,
  Moon,
  Sun,
  Plus
} from "lucide-react";
import { saveSettingsAction } from "./actions";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  initialSettings: any;
  user: any;
  hasData?: boolean;
}

export function SettingsForm({ initialSettings, user, hasData }: SettingsFormProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const canvaEnabled = process.env.NEXT_PUBLIC_CANVA_ENABLED === 'true';
  const canvaTestMode = process.env.NEXT_PUBLIC_CANVA_TEST_MODE === 'true';

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
      toast.error("An error occurred while saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      window.location.href = "/api/settings/export";
      toast.success("Data export started");
    } catch (error) {
      toast.error("Failed to export data");
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
          className="w-full sm:w-auto gap-2 h-10 px-6 font-semibold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      <div className="grid gap-8 pb-20">
        {/* NOTIFICATIONS SECTION */}
        <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-primary/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Bell className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Notifications</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-[24px] border border-border/20">
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">Abonnements liés</span>
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
                      <Label htmlFor={item.id} className="text-sm font-bold cursor-pointer">{item.label}</Label>
                      <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
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

        {/* PREFERENCES SECTION */}
        <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-primary/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl">
                <Settings2 className="size-4 text-primary" />
              </div>
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Préférences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-12">
            {/* Timezone */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Fuseau horaire</Label>
                <p className="text-sm text-muted-foreground font-medium">Utilisé pour la programmation des posts et les rapports d'analytics</p>
              </div>
              <Select value={settings.timezone} onValueChange={(v) => handleSelect('timezone', v)}>
                <SelectTrigger className="max-w-md h-12 bg-muted/20 border-border/40 rounded-xl px-4 font-bold text-sm">
                  <SelectValue placeholder="Sélectionner un fuseau horaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                  <SelectItem value="America/New_York">EST (Eastern Standard Time)</SelectItem>
                  <SelectItem value="Europe/London">GMT (Greenwich Mean Time)</SelectItem>
                  <SelectItem value="Asia/Tokyo">JST (Japan Standard Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appearance */}
            <div className="space-y-5 pt-10 border-t border-border/40">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Apparence</Label>
                <p className="text-sm text-muted-foreground font-medium">Choisissez entre le thème clair et sombre pour l'interface.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex-1 max-w-[160px] flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    theme === 'light' ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/40 hover:border-primary/20"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl", theme === 'light' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Sun className="size-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Clair</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex-1 max-w-[160px] flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                    theme === 'dark' ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/40 hover:border-primary/20"
                  )}
                >
                  <div className={cn("p-2.5 rounded-xl", theme === 'dark' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Moon className="size-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">Sombre</span>
                </button>
              </div>
            </div>

            {/* Language & Locale */}
            <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-border/40">
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Langue</Label>
                <Select value={settings.language} onValueChange={(v) => handleSelect('language', v)}>
                  <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl px-4 font-bold text-sm">
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
                <Select value={settings.locale} onValueChange={(v) => handleSelect('locale', v)}>
                  <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl px-4 font-bold text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="FR">FR</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="ES">ES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INTEGRATIONS SECTION */}
        <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-primary/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Plus className="size-4 text-primary" />
                </div>
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Intégrations</CardTitle>
              </div>
              {!canvaEnabled && (
                <Badge className="bg-[#7F77DD] hover:bg-[#7F77DD]/90 text-white border-none text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Bientôt disponible
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-[24px] border border-border/20">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-background border border-border/40 flex items-center justify-center p-2.5 shadow-sm">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" 
                    alt="Canva" 
                    className={cn("size-full", !canvaEnabled && "opacity-40 grayscale")} 
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-bold leading-none">Canva</Label>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium max-w-sm">
                    Créez tes visuels Canva directement depuis Creatabl et attache-les à tes posts.
                  </p>
                </div>
              </div>

              {canvaEnabled ? (
                <Link 
                  href="/api/canva/auth"
                  className={cn(buttonVariants({ size: 'default' }), "rounded-xl font-bold px-6 shadow-lg shadow-primary/20")}
                >
                  {user.canvaAccessToken ? "Connecté" : "Connecter Canva"}
                </Link>
              ) : canvaTestMode ? (
                <Link 
                  href="/api/canva/auth"
                  className={cn(buttonVariants({ size: 'default' }), "rounded-xl font-bold px-6 opacity-40 bg-muted text-muted-foreground border-none hover:opacity-80")}
                >
                  Connecter Canva (Test)
                </Link>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <div className="cursor-not-allowed">
                          <Button 
                            disabled 
                            className="rounded-xl font-bold px-6 opacity-40 bg-muted text-muted-foreground border-none"
                          >
                            Connecter Canva
                          </Button>
                        </div>
                      }
                    />
                    <TooltipContent className="bg-foreground text-background border-none text-[11px] font-bold py-2 px-3 rounded-lg shadow-xl">
                      <p>Intégration Canva en cours de validation.</p>
                      <p className="text-primary-foreground/60">Disponible très bientôt 🎨</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </CardContent>
        </Card>

        {/* DATA MANAGEMENT SECTION */}
        <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-destructive/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2.5 rounded-xl">
                <Save className="size-4 text-destructive" />
              </div>
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Gestion des données</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-destructive/5 rounded-[24px] border border-destructive/10">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-destructive">Exporter vos données personnelles</Label>
                <p className="text-xs text-muted-foreground font-medium max-w-md">Téléchargez une archive complète de vos posts, analytics et paramètres de compte au format JSON.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!hasData || exporting}
                onClick={handleExport}
                className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-bold px-5"
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
