"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles,
  Send,
  Calendar,
  Save,
  Loader2,
  Wand2,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Components
import { PlatformSelector } from "@/components/compose/platform-selector";
import { CaptionEditor } from "@/components/compose/caption-editor";
import { MediaUploader } from "@/components/compose/media-uploader";
import { SchedulePicker } from "@/components/compose/schedule-picker";
import { PostPreview } from "@/components/compose/post-preview";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface MediaFile {
  url: string;
  fileId: string;
  name: string;
}

const TONES = [
  { value: "professional", label: "Professionnel", icon: "💼" },
  { value: "storytelling", label: "Storytelling", icon: "📖" },
  { value: "viral", label: "Viral", icon: "🚀" },
  { value: "educational", label: "Éducatif", icon: "🎓" },
  { value: "conversational", label: "Conversationnel", icon: "💬" },
];

function ComposePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const dateParam = searchParams.get("date");
  const duplicateParam = searchParams.get("duplicate");

  const [postId, setPostId] = useState<string | null>(idParam);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);
  const lastSavedRef = useRef<string>("");

  // Handle Initial Load
  useEffect(() => {
    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        if (date.getHours() === 0 && date.getMinutes() === 0) {
          date.setHours(9, 0, 0, 0);
        }
        setScheduledAt(date);
      }
    }

    const fetchPost = async (id: string, isDuplicating = false) => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.post) {
          setContent(data.post.content || "");
          setSelectedPlatforms(data.post.platforms || []);
          if (data.post.scheduledAt && !isDuplicating) {
            setScheduledAt(new Date(data.post.scheduledAt));
          }
          if (data.post.mediaUrls) {
            setMediaFiles(data.post.mediaUrls.map((url: string, i: number) => ({
              url,
              fileId: `existing-${i}`,
              name: `Media ${i + 1}`
            })));
          }
          if (!isDuplicating) {
            lastSavedRef.current = JSON.stringify({ 
              content: data.post.content, 
              platforms: data.post.platforms, 
              mediaUrls: data.post.mediaUrls 
            });
          }
        }
      } catch (err) {
        toast.error("Failed to load post data");
      }
    };

    const contentParam = searchParams.get("content");
    const platformParam = searchParams.get("platform");

    if (contentParam) {
      setContent(decodeURIComponent(contentParam));
      if (platformParam) {
        const platforms = platformParam.split(",").map(p => p.trim().toLowerCase());
        setSelectedPlatforms(platforms);
      }
    } else if (idParam) {
      fetchPost(idParam, false);
    } else if (duplicateParam) {
      fetchPost(duplicateParam, true);
    } else {
      // Fetch latest draft if it exists
      const fetchLatestDraft = async () => {
        try {
          const res = await fetch("/api/posts?status=draft&limit=1");
          const data = await res.json();
          if (data.posts && data.posts.length > 0) {
            const draft = data.posts[0];
            // Only auto-load if it's very recent (last 24h) or has content
            if (draft.content) {
              setPostId(draft.id);
              setContent(draft.content);
              setSelectedPlatforms(draft.platforms || []);
              if (draft.mediaUrls) {
                setMediaFiles(draft.mediaUrls.map((url: string, i: number) => ({
                  url,
                  fileId: `draft-media-${i}`,
                  name: `Media ${i + 1}`
                })));
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch latest draft", err);
        }
      };
      fetchLatestDraft();
    }

    // Fetch account connections (Canva, etc.)
    const fetchConnections = async () => {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        if (data.canvaConnected) {
          setCanvaConnected(true);
        }
        setHasAccounts(data.accounts && data.accounts.length > 0);
      } catch (err) {
        console.error("Failed to fetch connections", err);
        setHasAccounts(false);
      }
    };
    fetchConnections();
  }, [idParam, dateParam]);

  // Autosave logic
  const performAutosave = useCallback(async () => {
    const currentData = { 
      content, 
      platforms: selectedPlatforms, 
      mediaUrls: mediaFiles.map(f => f.url),
      scheduledAt: scheduledAt?.toISOString(),
      status: "draft"
    };
    
    const currentDataStr = JSON.stringify({ 
      content: currentData.content, 
      platforms: currentData.platforms, 
      mediaUrls: currentData.mediaUrls 
    });

    if (currentDataStr === lastSavedRef.current) return;
    if (!content && mediaFiles.length === 0) return;

    setSaveStatus("saving");
    try {
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (!postId && data.postId) {
        setPostId(data.postId);
        // Update URL without refreshing
        window.history.replaceState(null, "", `/dashboard/compose?id=${data.postId}`);
      }

      lastSavedRef.current = currentDataStr;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
      toast.error("Échec de l'enregistrement automatique du résultat");
    }
  }, [content, selectedPlatforms, mediaFiles, scheduledAt, postId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content || mediaFiles.length > 0) {
        performAutosave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, selectedPlatforms, mediaFiles, scheduledAt, performAutosave]);

  const handlePost = async (isDraft = false) => {
    if (!content && mediaFiles.length === 0) {
      return toast.error("Please add some content or media");
    }
    if (selectedPlatforms.length === 0 && !isDraft) {
      return toast.error("Please select at least one platform");
    }

    setLoading(true);
    try {
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          mediaUrls: mediaFiles.map(f => f.url),
          mediaFiles,
          scheduledAt: scheduledAt?.toISOString(),
          status: isDraft ? "draft" : (scheduledAt ? "scheduled" : "published"),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save post");

      toast.success(isDraft ? "Brouillon enregistré !" : (postId ? "Post mis à jour !" : "Post programmé avec succès !"));
      router.push("/dashboard/posts");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!aiPrompt) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: aiPrompt, 
          action: "generate",
          platform: selectedPlatforms[0],
          tone: selectedTone 
        }),
      });
      const data = await res.json();
      if (data.result) {
        setContent(data.result);
        setIsAiDialogOpen(false);
        setAiPrompt("");
        toast.success("Contenu du post généré !");
      }
    } catch (err) {
      toast.error("La génération IA a échoué");
    } finally {
      setGenerating(false);
    }
  };

  if (hasAccounts === null) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  if (hasAccounts === false) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-full mx-auto pb-16 overflow-x-hidden animate-in fade-in duration-500">
        {/* Refined Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-2 w-full">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Créer un post</h1>
            </div>
            <p className="text-sm text-muted-foreground">Créez et programmez votre contenu social</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center 
          h-64 text-center border border-dashed border-gray-200 
          rounded-2xl p-8 w-full mt-4 bg-background">
          <p className="font-medium text-gray-500 mb-1">
            Connecte tes réseaux sociaux
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Connectez au moins un réseau social pour créer et publier du contenu.
          </p>
          <Link href="/dashboard/settings/connections" className="bg-[#534AB7] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#453da3] transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-full mx-auto pb-16 overflow-x-hidden">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-2 w-full">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Créer un post</h1>
            <AnimatePresence>
              {saveStatus !== "idle" && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  {saveStatus === "saving" && <Loader2 className="size-2.5 animate-spin" />}
                  {saveStatus === "saved" && <CheckCircle2 className="size-2.5 text-emerald-500" />}
                  {saveStatus === "error" && <AlertCircle className="size-2.5 text-destructive" />}
                  <span className="text-xs font-medium text-muted-foreground animate-pulse">
                  {saveStatus === "saving" ? "Enregistrement..." : saveStatus === "saved" ? "Enregistré" : "Erreur"}
                </span></motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-sm text-muted-foreground">Créez et programmez votre contenu social</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl shadow-sm text-sm" onClick={() => handlePost(true)} disabled={loading}>
            <Save className="size-3.5 mr-1.5" /> Sauvegarder
          </Button>
          <Button 
            onClick={() => handlePost(false)} 
            disabled={loading || !content.trim()} 
            size="sm"
            className="h-8 px-5 rounded-lg font-semibold bg-foreground text-background shadow-sm transition-all hover:opacity-90 active:scale-95 text-xs"
          >
            {loading ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : (
              scheduledAt ? <Calendar className="size-3.5 mr-1.5" /> : <Send className="size-3.5 mr-1.5" />
            )}
            {scheduledAt ? "Programmer" : "Publier maintenant"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start w-full">
        {/* Left Column: Composition Sections */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Platforms Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Plateformes</h3>
            <PlatformSelector 
              selectedPlatforms={selectedPlatforms} 
              onToggle={(p) => setSelectedPlatforms(prev => 
                prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
              )} 
            />
          </div>

          {/* Caption Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Caption</h3>
              
              {/* Integrated Tone Selector */}
              <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    title={tone.label}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      selectedTone === tone.value 
                        ? "bg-background shadow-sm text-foreground ring-1 ring-border" 
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <span className="text-sm">{tone.icon}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <CaptionEditor 
              content={content} 
              onChange={setContent} 
              selectedPlatforms={selectedPlatforms} 
              onOpenAiDialog={() => setIsAiDialogOpen(true)}
              tone={selectedTone as any}
              postId={postId}
            />
          </div>

          {/* Media Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Médias</h3>
            <MediaUploader 
              mediaFiles={mediaFiles} 
              selectedPlatforms={selectedPlatforms}
              onUpload={(file) => setMediaFiles([...mediaFiles, file])}
              onRemove={(id) => setMediaFiles(mediaFiles.filter(f => f.fileId !== id))}
              onTransform={(id, newUrl) => setMediaFiles(mediaFiles.map(f => f.fileId === id ? { ...f, url: newUrl } : f))}
              canvaConnected={canvaConnected}
            />
          </div>

          {/* Schedule Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Scheduling</h3>
            <SchedulePicker 
              scheduledAt={scheduledAt} 
              onChange={setScheduledAt} 
            />
          </div>

          {/* Bottom Smart Action Button */}
          <div className="flex justify-end pt-2">
             <Button className="rounded-xl shadow-lg shadow-primary/20 text-sm font-bold bg-foreground text-background" onClick={() => handlePost(false)} disabled={loading || !content.trim()}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {scheduledAt ? "Programmer" : "Publier maintenant"}
          </Button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-20 space-y-3">
          <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest px-2">Preview</h3>
          <PostPreview 
            content={content} 
            mediaFiles={mediaFiles} 
            platforms={selectedPlatforms} 
          />
        </aside>
      </div>

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-foreground" />
              Générateur de post IA
            </DialogTitle>
            <DialogDescription className="text-xs">
              Décrivez votre sujet et Gemini va générer une légende parfaite pour vous.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sujet</Label>
              <Textarea 
                placeholder="ex. Écrire un post sur le lancement de notre nouvelle fonctionnalité IA..."
                className="min-h-[100px] rounded-xl resize-none border focus-visible:ring-1 focus-visible:ring-foreground bg-muted/5"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ton souhaité</Label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left",
                      selectedTone === tone.value 
                        ? "bg-foreground text-background border-foreground shadow-sm" 
                        : "bg-background border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{tone.icon}</span>
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsAiDialogOpen(false)} className="rounded-lg text-xs">Annuler</Button>
            <Button onClick={handleGeneratePost} size="sm" disabled={generating || !aiPrompt} className="rounded-lg px-6 bg-foreground text-background text-xs">
              {generating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
              Générer le post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" /></div>}>
      <ComposePageInner />
    </Suspense>
  );
}
