"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { 
  Bell, 
  Settings2, 
  Save,
  Loader2,
  Moon,
  Sun
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
        toast.success("Settings saved successfully");
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
            Settings
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your notification preferences and application configurations.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          className="w-full sm:w-auto gap-2 h-10 px-6 font-semibold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
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
                <Label className="text-sm font-semibold leading-none">Email Notifications</Label>
                <p className="text-sm text-muted-foreground font-medium">Receive important account and platform updates via email.</p>
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">Linked Subscriptions</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: 'notifyNewComments', label: 'New Comments', desc: 'Alerts for post interactions' },
                  { id: 'notifyNewFollowers', label: 'New Followers', desc: 'Growth alerts across accounts' },
                  { id: 'notifyPostPerformance', label: 'Post Performance', desc: 'Engagement & reach summaries' },
                  { id: 'notifyScheduledPosts', label: 'Scheduled Reminders', desc: 'Alerts before posts go live' },
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
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-12">
            {/* Timezone */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Timezone</Label>
                <p className="text-sm text-muted-foreground font-medium">Used for post scheduling and analytics reporting</p>
              </div>
              <Select value={settings.timezone} onValueChange={(v) => handleSelect('timezone', v)}>
                <SelectTrigger className="max-w-md h-12 bg-muted/20 border-border/40 rounded-xl px-4 font-bold text-sm">
                  <SelectValue placeholder="Select timezone" />
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
                <Label className="text-sm font-semibold">Appearance</Label>
                <p className="text-sm text-muted-foreground font-medium">Choose between light and dark theme for the interface.</p>
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
                  <span className="text-xs font-black uppercase tracking-widest">Light</span>
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
                  <span className="text-xs font-black uppercase tracking-widest">Dark</span>
                </button>
              </div>
            </div>

            {/* Language & Locale */}
            <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-border/40">
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Language</Label>
                <Select value={settings.language} onValueChange={(v) => handleSelect('language', v)}>
                  <SelectTrigger className="h-12 bg-muted/20 border-border/40 rounded-xl px-4 font-bold text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Regional Locale</Label>
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

        {/* DATA MANAGEMENT SECTION */}
        <Card className="rounded-[32px] border-border/50 shadow-sm overflow-hidden bg-card transition-all hover:border-destructive/10">
          <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2.5 rounded-xl">
                <Save className="size-4 text-destructive" />
              </div>
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Data Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-destructive/5 rounded-[24px] border border-destructive/10">
              <div className="space-y-1">
                <Label className="text-sm font-bold text-destructive">Export Your Personal Data</Label>
                <p className="text-xs text-muted-foreground font-medium max-w-md">Download a complete archive of your posts, analytics, and account settings in JSON format.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!hasData || exporting}
                onClick={handleExport}
                className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-bold px-5"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Export Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
