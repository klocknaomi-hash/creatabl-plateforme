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
import { AIToolbar } from "@/components/AIToolbar";

import { PostPlatform, PostTone } from "@/lib/ai-provider";

interface CaptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  selectedPlatforms: string[];
  onOpenAiDialog: () => void;
  tone?: PostTone;
  postId?: string | null;
}

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
};

export function CaptionEditor({ content, onChange, selectedPlatforms, onOpenAiDialog, tone, postId }: CaptionEditorProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatforms[0] || 'instagram',
          idea: aiPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.message);
          return;
        }
        setError(data.message || 'Erreur de génération');
        return;
      }

      // Insert generated text into the caption editor
      onChange(data.text);
      setAiPrompt('');
      toast.success("Caption IA générée !");
    } catch (err) {
      setError('Erreur de connexion. Réessaie.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Textarea
          placeholder="Quoi de neuf ?..."
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
              Sélectionnez une plateforme pour voir la limite de caractères
            </div>
          )}
        </div>
      </div>

      {/* AI Toolbar for Quick Actions */}
      <div className="px-1">
        <AIToolbar 
          content={content}
          postId={postId}
          tone={tone}
          platform={selectedPlatforms[0] as PostPlatform | undefined}
          onResult={(improved) => onChange(improved)}
        />
      </div>

      {/* AI Prompt Block */}
      <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
            Générer avec l'IA <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          </span>
          <Button 
            variant="link" 
            size="sm" 
            onClick={onOpenAiDialog}
            className="h-auto p-0 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Ouvrir le Studio
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Décris ton idée de post..."
            className="h-9 text-sm rounded-lg border-border/40 bg-background shadow-none focus-visible:ring-1 focus-visible:ring-foreground"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateAI()}
          />
          <Button 
            size="sm" 
            onClick={handleGenerateAI} 
            disabled={generating || !aiPrompt}
            className="rounded-lg px-4 h-9 font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Générer"}
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
