"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Sparkles, 
  AlertTriangle, 
  Globe, 
  RefreshCw, 
  Check, 
  X, 
  Info,
  ExternalLink
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "news" | "alert" | "platform" | "update";
  timestamp: string;
  link?: string;
}

const SYSTEM_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "news-threads",
    title: "L'intégration Threads est disponible !",
    description: "Vous pouvez désormais connecter votre compte Threads (Meta) et planifier vos publications automatiquement depuis Creatabl.",
    type: "news",
    timestamp: "Il y a 2 heures",
    link: "/dashboard/settings/connections"
  },
  {
    id: "alert-meta-reels",
    title: "Incident API Instagram Reels",
    description: "Meta signale des perturbations sur l'API de publication des Reels. Certaines publications planifiées peuvent subir des retards.",
    type: "alert",
    timestamp: "Il y a 5 heures"
  },
  {
    id: "update-gen-ia",
    title: "Génération de posts IA optimisée",
    description: "Le moteur de suggestions d'idées IA intègre désormais les dernières tendances YouTube et Reddit avec plus de précision.",
    type: "update",
    timestamp: "Hier",
    link: "/dashboard/agent-ia"
  },
  {
    id: "platform-tiktok",
    title: "Limites temporaires de l'API TikTok",
    description: "TikTok impose de nouvelles limites de fréquence de publication pour les comptes professionnels créés récemment. Pensez à valider vos informations.",
    type: "platform",
    timestamp: "Il y a 3 jours"
  }
];

export function NotificationsPopover({ className }: { className?: string }) {
  const router = useRouter();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("creatabl_read_notifications");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load read notifications", e);
    }
  }, []);

  const saveReadIds = (ids: string[]) => {
    setReadIds(ids);
    try {
      localStorage.setItem("creatabl_read_notifications", JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to save read notifications", e);
    }
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
  };

  const toggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readIds.includes(id)) {
      saveReadIds(readIds.filter(item => item !== id));
    } else {
      saveReadIds([...readIds, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = SYSTEM_NOTIFICATIONS.map(n => n.id);
    saveReadIds(allIds);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = mounted 
    ? SYSTEM_NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length 
    : 0;

  const getTypeStyles = (type: NotificationItem["type"]) => {
    switch (type) {
      case "news":
        return {
          bg: "bg-[#F3EEFD] dark:bg-[#5B1BB8]/30",
          border: "border-[#E7DCFC] dark:border-[#5B1BB8]/40",
          text: "text-[#5B1BB8] dark:text-[#8A38F5]",
          icon: Sparkles
        };
      case "alert":
        return {
          bg: "bg-[#FDF2DF] dark:bg-[#8A4B00]/20",
          border: "border-[#FDF2DF] dark:border-[#8A4B00]/30",
          text: "text-[#8A4B00] dark:text-[#8A4B00]",
          icon: AlertTriangle
        };
      case "update":
        return {
          bg: "bg-[#E7F6EE] dark:bg-[#0E7445]/20",
          border: "border-[#E7F6EE] dark:border-[#0E7445]/30",
          text: "text-[#0E7445] dark:text-[#0E7445]",
          icon: RefreshCw
        };
      case "platform":
      default:
        return {
          bg: "bg-[#E9F0FC] dark:bg-[#1F5BB8]/20",
          border: "border-[#E9F0FC] dark:border-[#1F5BB8]/30",
          text: "text-[#1F5BB8] dark:text-[#1F5BB8]",
          icon: Globe
        };
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            id="topbar-notification-bell"
            className={cn("cr-iconbtn", className)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ""}`}
          />
        }
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && <span className="cr-pip" aria-hidden="true" />}
      </PopoverTrigger>

      <PopoverContent className="w-85 p-0 bg-popover border border-border/80 shadow-xl rounded-2xl overflow-hidden z-50 mr-4" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#F8F7FC]/50 dark:bg-muted/30 border-b border-border/80">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-[#7225E3]/10 text-[#7225E3] text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#7225E3] hover:text-[#5B1BB8] transition-colors cursor-pointer"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
          {SYSTEM_NOTIFICATIONS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
                <Info className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">Aucune notification</p>
              <p className="text-xs text-muted-foreground mt-0.5">Nous vous préviendrons des nouveautés et alertes.</p>
            </div>
          ) : (
            SYSTEM_NOTIFICATIONS.map((item) => {
              const isRead = readIds.includes(item.id);
              const styles = getTypeStyles(item.type);
              const Icon = styles.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex gap-3 p-3.5 transition-colors cursor-pointer relative hover:bg-muted/40",
                    !isRead && "bg-[#7225E3]/[0.02]"
                  )}
                >
                  {/* Left Icon Badge */}
                  <div className={cn("size-8.5 rounded-xl border flex items-center justify-center shrink-0 mt-0.5", styles.bg, styles.border)}>
                    <Icon className={cn("size-4", styles.text)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className={cn("text-xs font-semibold leading-tight truncate", !isRead ? "text-foreground font-semibold" : "text-muted-foreground")}>
                        {item.title}
                      </h4>
                      {!isRead && (
                        <span className="size-1.5 bg-[#7225E3] rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-normal mt-1 break-words font-medium">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {item.timestamp}
                      </span>
                      {item.link && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-[#7225E3] hover:underline font-semibold">
                          Voir
                          <ExternalLink className="size-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mark as read tick action */}
                  <button
                    onClick={(e) => toggleRead(item.id, e)}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 absolute right-3 top-3.5 p-1 rounded-md hover:bg-muted transition-all cursor-pointer text-muted-foreground hover:text-foreground",
                      "group-hover:opacity-100 focus:opacity-100 flex items-center justify-center"
                    )}
                    style={{ opacity: 1 }} // make it visible on hover easily
                    title={isRead ? "Marquer comme non lu" : "Marquer comme lu"}
                  >
                    <Check className={cn("size-3.5", isRead ? "text-[#7225E3] stroke-[3]" : "text-muted-foreground")} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border/80 bg-[#F8F7FC]/50 dark:bg-muted/30 text-center">
          <div className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1">
            <Info className="size-3 text-muted-foreground" />
            <span>Actualités et alertes en temps réel</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
