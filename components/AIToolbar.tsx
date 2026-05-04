// components/AIToolbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useGeneratePost } from "@/hooks/useGeneratePost";
import { PostPlatform, PostTone, GenerateAction } from "@/lib/ai-provider";
import { 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Type, 
  ChevronDown, 
  Smartphone,
  Check,
  Zap,
  RotateCcw,
  Languages,
  ArrowRight,
  Minimize2,
  Maximize2,
  Save,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AIUsageIndicator from "./AIUsageIndicator";
import AILimitModal from "./AILimitModal";


interface AIToolbarProps {
  content: string;
  postId?: string | null;
  platform?: PostPlatform;
  tone?: PostTone;
  onResult: (result: string) => void;
}

const TONES: { value: PostTone; label: string; icon: string; description: string }[] = [
  { value: "professional", label: "Professionnel", icon: "💼", description: "Expert et autoritaire" },
  { value: "storytelling", label: "Storytelling", icon: "📖", description: "Narratif et engageant" },
  { value: "viral", label: "Viral", icon: "🚀", description: "Percutant et partageable" },
  { value: "educational", label: "Éducatif", icon: "🎓", description: "Clair et éducatif" },
  { value: "conversational", label: "Conversationnel", icon: "💬", description: "Naturel et amical" },
];

export function AIToolbar({ content, platform, onResult, postId, tone: propTone }: AIToolbarProps) {
  const { generate, loading } = useGeneratePost({ 
    onSuccess: (res: string) => {
      onResult(res);
      toast.success("Magie appliquée !");
    },
    onError: (err: string) => toast.error(err)
  });
  const [activeTone, setActiveTone] = useState<PostTone | null>(propTone || null);
  const [isHovered, setIsHovered] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [usage, setUsage] = useState({ used: 0, limit: 30, plan: "starter" });
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Fetch initial usage
  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/ai-usage");
        if (res.ok) {
          const data = await res.json();
          setUsage({ used: data.used, limit: data.limit, plan: data.plan });
        }
      } catch (err) {
        console.error("Failed to fetch AI usage", err);
      }
    }
    fetchUsage();
  }, []);

  // Sync activeTone with propTone if it changes
  useEffect(() => {
    if (propTone) setActiveTone(propTone);
  }, [propTone]);

  const disabled = loading || !content?.trim();

  async function handleAction(action: GenerateAction, toneOverride?: PostTone) {
    if (toneOverride) setActiveTone(toneOverride);
    const response = await generate({
      content,
      action: action,
      platform,
      tone: toneOverride || activeTone || undefined,
    });

    if (response) {
      if (response.limitReached) {
        setUsage({ used: response.used, limit: response.limit, plan: response.plan });
        setIsLimitModalOpen(true);
        return;
      }

      const generatedResult = response.result;
      setUsage({ used: response.used, limit: response.limit, plan: response.plan });
      
      if (generatedResult) {
        onResult(generatedResult);
        
        // Database Autosave if postId is present
        if (postId) {
          setSaveStatus("saving");
          try {
            const res = await fetch(`/api/posts/${postId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: generatedResult }),
            });
            if (!res.ok) throw new Error("Save failed");
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          } catch (err) {
            setSaveStatus("error");
            toast.error("Échec de l'enregistrement automatique du résultat");
          }
        }
      }
    }
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "flex items-center gap-2 p-1.5 rounded-2xl border transition-all duration-300 overflow-x-auto flex-nowrap",
          "bg-background/80 backdrop-blur-md shadow-lg shadow-primary/5",
          isHovered ? "border-primary/30 ring-4 ring-primary/5" : "border-border/60"
        )}>
          {/* Magic Badge */}
          <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 mr-1 group overflow-hidden relative">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="size-3.5 text-primary fill-primary/20" />
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Gemini AI</span>
            
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-sm"
                >
                  <RefreshCw className="size-3 animate-spin text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            {/* Main Actions */}
            <TooltipButton
              onClick={() => handleAction("improve")}
              disabled={disabled}
              icon={<Zap className={cn("size-3.5", !disabled && "text-amber-500")} />}
              label="Améliorer"
              loading={loading}
              tooltip="Améliorer le style"
            />

            <TooltipButton
              onClick={() => handleAction("rewrite")}
              disabled={disabled}
              icon={<RotateCcw className="size-3.5 text-blue-500" />}
              label="Reformuler"
              loading={loading}
              tooltip="Reformuler depuis un nouvel angle"
            />

            <TooltipButton
              onClick={() => handleAction("shorten")}
              disabled={disabled}
              icon={<Minimize2 className="size-3.5 text-emerald-500" />}
              label="Raccourcir"
              loading={loading}
              tooltip="Raccourcir le contenu"
            />

            <TooltipButton
              onClick={() => handleAction("lengthen")}
              disabled={disabled}
              icon={<Maximize2 className="size-3.5 text-orange-500" />}
              label="Allonger"
              loading={loading}
              tooltip="Allonger le contenu"
            />

            {/* Tone Selector */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={disabled}
                          className={cn(
                            "h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 transition-all",
                            "hover:bg-primary/5 hover:text-primary active:scale-95"
                          )}
                        />
                      }
                    />
                  }
                >
                  <Type className="size-3.5" />
                  <span>Ton</span>
                  <ChevronDown className="size-3 opacity-40" />
                </TooltipTrigger>
                <TooltipContent>Changer le ton du post</TooltipContent>
              </Tooltip>
              <DropdownMenuContent 
                align="start" 
                className="w-56 p-1.5 rounded-2xl border-border/50 shadow-2xl shadow-primary/10 backdrop-blur-xl bg-background/95"
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Choisissez une voix</p>
                </div>
                {TONES.map((t) => (
                  <DropdownMenuItem
                    key={t.value}
                    onClick={() => handleAction("change_tone", t.value)}
                    className="rounded-xl text-xs font-semibold gap-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors group"
                  >
                    <span className="text-lg bg-muted/50 size-8 flex items-center justify-center rounded-lg group-hover:bg-primary/10 transition-colors">{t.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <span>{t.label}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">{t.description}</span>
                    </div>
                    {activeTone === t.value && (
                      <motion.div layoutId="active-tone" className="ml-auto">
                        <Check className="size-3.5 text-primary" />
                      </motion.div>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Platform Specific */}
            {platform && (
              <>
                <div className="h-4 w-px bg-border/60 mx-1" />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction("optimize_platform")}
                        disabled={disabled}
                        className={cn(
                          "h-8 px-3 rounded-xl text-xs font-black gap-2 transition-all group",
                          "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40",
                          "shadow-[0_0_15px_-5px_rgba(var(--primary),0.3)]"
                        )}
                      />
                    }
                  >
                    <Smartphone className="size-3.5 transition-transform group-hover:scale-110" />
                    <span className="capitalize">{platform} Prêt</span>
                    <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </TooltipTrigger>
                  <TooltipContent>Optimiser spécifiquement pour {platform}</TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Save Status Indicator */}
            <AnimatePresence>
              {saveStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30 ml-1"
                >
                  {saveStatus === "saving" ? (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  ) : saveStatus === "saved" ? (
                    <Save className="size-3 text-emerald-500" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-destructive" />
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {saveStatus === "saving" ? "Enregistrement" : saveStatus === "saved" ? "Enregistré" : "Erreur"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-4 w-px bg-border/60 mx-1" />
            <AIUsageIndicator used={usage.used} limit={usage.limit} />
          </div>
        </div>
        
        <AILimitModal 
          isOpen={isLimitModalOpen} 
          onClose={() => setIsLimitModalOpen(false)} 
          used={usage.used} 
          limit={usage.limit} 
          plan={usage.plan} 
        />
      </motion.div>
    </TooltipProvider>
  );
}

function TooltipButton({ 
  onClick, 
  disabled, 
  icon, 
  label, 
  loading,
  tooltip
}: { 
  onClick: () => void; 
  disabled: boolean; 
  icon: React.ReactNode; 
  label: string;
  loading: boolean;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 transition-all group",
              "hover:bg-primary/5 hover:text-primary active:scale-95"
            )}
          />
        }
      >
        <div className={cn("transition-transform group-hover:scale-110 group-active:scale-90", loading && "animate-spin")}>
          {loading ? <RefreshCw className="size-3.5" /> : icon}
        </div>
        <span>{label}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
