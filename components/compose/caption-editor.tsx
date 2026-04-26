"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface CaptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  selectedPlatforms: string[];
  onOpenAiDialog: () => void;
}

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
};

export function CaptionEditor({ content, onChange, selectedPlatforms, onOpenAiDialog }: CaptionEditorProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiPrompt) {
      toast.error("Please enter a prompt for the AI");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, platforms: selectedPlatforms }),
      });

      const data = await res.json();
      if (data.generated) {
        onChange(data.generated);
        setAiPrompt("");
        toast.success("AI Caption generated!");
      } else {
        throw new Error(data.error || "Failed to generate caption");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Textarea
          placeholder="What's on your mind?..."
          className="min-h-[160px] text-base leading-relaxed resize-none p-4 pb-10 rounded-xl border border-border/60 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:border-foreground transition-all bg-muted/5"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute bottom-3 right-4">
          {selectedPlatforms.length > 0 ? (
            (() => {
              const minLimit = Math.min(
                ...selectedPlatforms.map(p => PLATFORM_LIMITS[p.toLowerCase()] || 2000)
              );
              const isOver = content.length > minLimit;
              
              return (
                <div className={cn(
                  "text-[11px] font-bold transition-colors",
                  isOver ? "text-destructive animate-pulse" : "text-muted-foreground"
                )}>
                  {content.length} / {minLimit}
                </div>
              );
            })()
          ) : (
            <div className="text-[10px] font-medium text-muted-foreground/60 italic">
              Select platform to see character limit
            </div>
          )}
        </div>
      </div>

      {/* AI Prompt Block */}
      <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
            AI Prompt <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          </span>
          <Button 
            variant="link" 
            size="sm" 
            onClick={onOpenAiDialog}
            className="h-auto p-0 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Options
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Create professional post..."
            className="h-9 text-sm rounded-lg border-border/40 bg-background shadow-none focus-visible:ring-1 focus-visible:ring-foreground"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateAI()}
          />
          <Button 
            size="sm" 
            onClick={handleGenerateAI} 
            disabled={generating || !aiPrompt}
            className="rounded-lg px-4 h-9 font-bold bg-foreground text-background hover:bg-foreground/90 transition-all"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
