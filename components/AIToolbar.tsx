// components/AIToolbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useGeneratePost } from "@/hooks/useGeneratePost";
import { PostPlatform, PostTone } from "@/lib/ai-provider";
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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AIToolbarProps {
  content: string;
  postId?: string | null;
  platform?: PostPlatform;
  tone?: PostTone;
  onResult: (result: string) => void;
}

const TONES: { value: PostTone; label: string; icon: string; description: string }[] = [
  { value: "professionnel", label: "Professionnel", icon: "💼", description: "Expert et autoritaire" },
  { value: "storytelling", label: "Storytelling", icon: "📖", description: "Narratif et captivant" },
  { value: "viral", label: "Viral", icon: "🚀", description: "Impactant et partageable" },
  { value: "educatif", label: "Éducatif", icon: "🎓", description: "Clair et pédagogique" },
  { value: "conversationnel", label: "Conversationnel", icon: "💬", description: "Naturel et proche" },
];

export function AIToolbar({ content, platform, onResult, postId, tone: propTone }: AIToolbarProps) {
  const { generate, loading } = useGeneratePost({ 
    onSuccess: (res) => {
      onResult(res);
      toast.success("Magic applied!");
    },
    onError: (err) => toast.error(err)
  });
  const [activeTone, setActiveTone] = useState<PostTone | null>(propTone || null);
  const [isHovered, setIsHovered] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Sync activeTone with propTone if it changes
  useEffect(() => {
    if (propTone) setActiveTone(propTone);
  }, [propTone]);

  const disabled = loading || !content?.trim();

  async function handleAction(action: string, toneOverride?: PostTone) {
    if (toneOverride) setActiveTone(toneOverride);
    const result = await generate({
      content,
      action: action as any,
      platform,
      tone: toneOverride || activeTone || undefined,
    });

    if (result) {
      onResult(result);
      
      // Database Autosave if postId is present
      if (postId) {
        setSaveStatus("saving");
        try {
          const res = await fetch(`/api/posts/${postId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: result }),
          });
          if (!res.ok) throw new Error("Save failed");
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (err) {
          setSaveStatus("error");
          toast.error("Failed to autosave result to database");
        }
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "flex items-center gap-1.5 p-1.5 rounded-2xl border transition-all duration-300",
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
            onClick={() => handleAction("ameliorer")}
            disabled={disabled}
            icon={<Zap className={cn("size-3.5", !disabled && "text-amber-500")} />}
            label="Améliorer"
            loading={loading}
          />

          <TooltipButton
            onClick={() => handleAction("reformuler")}
            disabled={disabled}
            icon={<RotateCcw className="size-3.5 text-blue-500" />}
            label="Reformuler"
            loading={loading}
          />

          <TooltipButton
            onClick={() => handleAction("raccourcir")}
            disabled={disabled}
            icon={<Minimize2 className="size-3.5 text-emerald-500" />}
            label="Raccourcir"
            loading={loading}
          />

          <TooltipButton
            onClick={() => handleAction("allonger")}
            disabled={disabled}
            icon={<Maximize2 className="size-3.5 text-orange-500" />}
            label="Allonger"
            loading={loading}
          />

          {/* Tone Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                className={cn(
                  "h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 transition-all",
                  "hover:bg-primary/5 hover:text-primary active:scale-95"
                )}
              >
                <Type className="size-3.5" />
                <span>Ton</span>
                <ChevronDown className="size-3 opacity-40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-56 p-1.5 rounded-2xl border-border/50 shadow-2xl shadow-primary/10 backdrop-blur-xl bg-background/95"
            >
              <div className="px-3 py-2 mb-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Choisir une voix</p>
              </div>
              {TONES.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => handleAction("changer_ton", t.value)}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("optimiser_plateforme")}
                disabled={disabled}
                className={cn(
                  "h-8 px-3 rounded-xl text-xs font-black gap-2 transition-all group",
                  "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40",
                  "shadow-[0_0_15px_-5px_rgba(var(--primary),0.3)]"
                )}
              >
                <Smartphone className="size-3.5 transition-transform group-hover:scale-110" />
                <span className="capitalize">{platform} Ready</span>
                <ArrowRight className="size-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
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
                  {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : "Error"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function TooltipButton({ 
  onClick, 
  disabled, 
  icon, 
  label, 
  loading 
}: { 
  onClick: () => void; 
  disabled: boolean; 
  icon: React.ReactNode; 
  label: string;
  loading: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 transition-all group",
        "hover:bg-primary/5 hover:text-primary active:scale-95"
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110 group-active:scale-90", loading && "animate-spin")}>
        {loading ? <RefreshCw className="size-3.5" /> : icon}
      </div>
      <span>{label}</span>
    </Button>
  );
}
