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
  AlertCircle,
  Briefcase,
  BookOpen,
  Rocket,
  GraduationCap,
  MessageCircle,
  CalendarClock,
} from "lucide-react";
import { checkPost } from "@/lib/network-rules";
import { Alert as DsAlert } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Components
import { PlatformSelector } from "@/components/compose/platform-selector";
import { CaptionEditor } from "@/components/compose/caption-editor";
import { EmptyState } from "@/components/ds";
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

interface MediaFile {
  url: string;
  fileId: string;
  name: string;
}

const TONES = [
  { value: "professional", label: "Professionnel", icon: Briefcase },
  { value: "storytelling", label: "Storytelling", icon: BookOpen },
  { value: "viral", label: "Viral", icon: Rocket },
  { value: "educational", label: "Éducatif", icon: GraduationCap },
  { value: "conversational", label: "Conversationnel", icon: MessageCircle },
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
  const [draftCreatedAt, setDraftCreatedAt] = useState<Date | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const draftRequestedRef = useRef(false);

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
          if (!isDuplicating && data.post.createdAt) setDraftCreatedAt(new Date(data.post.createdAt));
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
        toast.error("Impossible de charger le post");
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
      // « Créer un post » ouvre toujours un nouveau brouillon : on réutilise le dernier
      // brouillon vide s'il existe, sinon on en crée un. Sa date de création s'affiche.
      const ensureDraft = async () => {
        if (draftRequestedRef.current) return;
        draftRequestedRef.current = true;
        try {
          const res = await fetch("/api/posts?status=draft&limit=1");
          const data = await res.json();
          const latest = data.posts?.[0];
          if (latest && !latest.content && !(latest.mediaUrls?.length > 0)) {
            setPostId(latest.id);
            setDraftCreatedAt(new Date(latest.createdAt));
            window.history.replaceState(null, "", `/dashboard/compose?id=${latest.id}`);
            return;
          }
          const created = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: "", platforms: [], mediaUrls: [], status: "draft" }),
          });
          const createdData = await created.json();
          if (created.ok && createdData.postId) {
            setPostId(createdData.postId);
            setDraftCreatedAt(new Date());
            window.history.replaceState(null, "", `/dashboard/compose?id=${createdData.postId}`);
          }
        } catch (err) {
          console.error("Failed to create draft", err);
        }
      };
      ensureDraft();
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

  // Contraintes de chaque réseau sélectionné (longueur, médias, vidéo).
  const networkIssues = checkPost(
    content,
    mediaFiles.map((f) => ({ url: f.url, mimeType: (f as { mimeType?: string }).mimeType })),
    selectedPlatforms
  );
  const blockingIssues = networkIssues.filter((i) => i.level === "error");

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
      setLastSavedAt(new Date());
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

  const [pendingAction, setPendingAction] = useState<"draft" | "now" | "schedule" | null>(null);

  // Brouillon, publication immédiate ou programmation (ordre des boutons du design system).
  const handlePost = async (isDraft = false, mode: "now" | "schedule" = scheduledAt ? "schedule" : "now") => {
    if (!content && mediaFiles.length === 0) {
      return toast.error("Ajoutez du texte ou un média");
    }
    if (selectedPlatforms.length === 0 && !isDraft) {
      return toast.error("Sélectionnez au moins un réseau");
    }
    if (!isDraft && blockingIssues.length > 0) {
      return toast.error(blockingIssues[0].message);
    }
    if (!isDraft && mode === "schedule" && !scheduledAt) {
      return toast.error("Choisissez une date de programmation");
    }
    setPendingAction(isDraft ? "draft" : mode);

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
          scheduledAt: mode === "schedule" ? scheduledAt?.toISOString() : undefined,
          status: isDraft ? "draft" : (mode === "schedule" ? "scheduled" : "published"),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save post");

      toast.success(
        isDraft ? "Brouillon enregistré" : mode === "schedule" ? "Post programmé" : "Publication envoyée",
        isDraft || mode === "schedule"
          ? undefined
          : { description: `Envoyé sur ${selectedPlatforms.length} réseau${selectedPlatforms.length > 1 ? "x" : ""}. Le statut apparaît dans Publications.` }
      );
      router.push("/dashboard/posts");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setPendingAction(null);
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

        <EmptyState
          illustration="posts"
          title="Connectez vos réseaux sociaux"
          text="Connectez au moins un réseau social pour créer et publier du contenu."
        >
          <Link href="/dashboard/settings/connections" className="cr-btn cr-btn--primary">
            Connecter un compte
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-full mx-auto pb-16 overflow-x-hidden">
      {/* En-tête (ComposerPage du design system) : titre et état du brouillon */}
      <div className="flex flex-wrap items-center gap-3 pt-2 w-full">
        <h1 className="font-heading text-[28px] leading-9 font-semibold tracking-[-0.01em] text-[#14121F]">{idParam ? "Modifier le post" : "Nouveau post"}</h1>
        <span className="cr-badge cr-badge--plain" aria-live="polite">
          {saveStatus === "saving" && <Loader2 className="size-3 animate-spin" aria-hidden="true" />}
          {saveStatus === "error" && <AlertCircle className="size-3 text-[#B42318]" aria-hidden="true" />}
          {saveStatus === "saving"
            ? "Enregistrement…"
            : saveStatus === "error"
              ? "Brouillon non enregistré"
              : lastSavedAt
                ? `Brouillon enregistré à ${lastSavedAt.getHours()} h ${String(lastSavedAt.getMinutes()).padStart(2, "0")}`
                : draftCreatedAt
                  ? `Brouillon créé le ${((d: Date) => `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}`)(draftCreatedAt)}`
                  : "Nouveau brouillon"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 items-start w-full">
        {/* Left Column: Composition Sections */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Platforms Card */}
          <div className="bg-white rounded-xl border border-[#E8E6F0] p-6 space-y-4">
            <h3 className="font-heading text-base font-semibold text-[#14121F]">Réseaux</h3>
            <PlatformSelector 
              selectedPlatforms={selectedPlatforms} 
              onToggle={(p) => setSelectedPlatforms(prev => 
                prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
              )} 
            />
          </div>

          {/* Caption Card */}
          <div className="bg-white rounded-xl border border-[#E8E6F0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-[#14121F]">Texte du post</h3>
              
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
                        : "text-[#6B6780] hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <tone.icon className="size-4" aria-hidden="true" />
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
          <div className="bg-white rounded-xl border border-[#E8E6F0] p-6 space-y-4">
            <h3 className="font-heading text-base font-semibold text-[#14121F]">Médias</h3>
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
          <div className="bg-white rounded-xl border border-[#E8E6F0] p-6 space-y-4">
            <h3 className="font-heading text-base font-semibold text-[#14121F]">Programmation</h3>
            <SchedulePicker 
              scheduledAt={scheduledAt} 
              onChange={setScheduledAt} 
            />
          </div>

          {/* Contraintes des réseaux sélectionnés */}
          {networkIssues.length > 0 && (
            <div className="grid gap-2">
              {networkIssues.map((issue, i) => (
                <DsAlert key={i} tone={issue.level === "error" ? "error" : "warning"} title={issue.message} />
              ))}
            </div>
          )}

          {/* Pied d'actions (ComposerPage) : brouillon (fantôme), publier maintenant (secondaire), programmer (principal) */}
          <div className="cp-actions">
            <span className="left">
              {selectedPlatforms.length === 0 ? (
                <><AlertCircle className="size-3.5" aria-hidden="true" />Choisissez au moins un réseau</>
              ) : blockingIssues.length > 0 ? (
                <><AlertCircle className="size-3.5 text-[#B42318]" aria-hidden="true" />{blockingIssues.length} point{blockingIssues.length > 1 ? "s" : ""} à corriger</>
              ) : (
                <><CheckCircle2 className="size-3.5 text-[#0E7445]" aria-hidden="true" />Prêt pour {selectedPlatforms.map((p) => ({ twitter: "X", instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", tiktok: "TikTok" } as Record<string, string>)[p] ?? p).join(", ")}</>
              )}
            </span>
            <Button variant="ghost" className="h-11 px-5 text-[#7225E3] hover:bg-[#F3EEFD] hover:text-[#5B1BB8]" onClick={() => handlePost(true)} loading={pendingAction === "draft"} disabled={loading}>
              {pendingAction !== "draft" && <Save className="size-4" />}
              Enregistrer le brouillon
            </Button>
            <Button
              variant="outline"
              className="h-11 px-5"
              onClick={() => handlePost(false, "now")}
              loading={pendingAction === "now"}
              disabled={loading || (!content.trim() && mediaFiles.length === 0) || selectedPlatforms.length === 0 || blockingIssues.length > 0}
            >
              {pendingAction !== "now" && <Send className="size-4" />}
              {pendingAction === "now" ? "Publication…" : "Publier maintenant"}
            </Button>
            <Button
              className="h-11 px-5 bg-[image:var(--gradient-cta)] hover:bg-[#7225E3] hover:bg-none"
              onClick={() => handlePost(false, "schedule")}
              loading={pendingAction === "schedule"}
              disabled={loading || !scheduledAt || (!content.trim() && mediaFiles.length === 0) || selectedPlatforms.length === 0 || blockingIssues.length > 0}
              title={!scheduledAt ? "Activez « Programmer pour plus tard » et choisissez une date" : undefined}
            >
              {pendingAction !== "schedule" && <CalendarClock className="size-[18px]" />}
              {pendingAction === "schedule" ? "Programmation…" : "Programmer"}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <aside className="hidden lg:block w-[480px] flex-shrink-0 sticky top-20 space-y-3 rounded-[12px] border border-[#E8E6F0] bg-[#F8F7FC] p-5" aria-label="Aperçu de la publication">
          <h3 className="font-heading text-base font-semibold text-[#14121F] px-2">Aperçu</h3>
          <PostPreview 
            content={content} 
            mediaFiles={mediaFiles} 
            platforms={selectedPlatforms} 
            scheduledAt={scheduledAt}
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
              Décrivez votre sujet : l'IA rédige un post dans le ton choisi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#14121F]">Sujet</Label>
              <Textarea 
                placeholder="ex. Écrire un post sur le lancement de notre nouvelle fonctionnalité IA..."
                className="min-h-[100px] rounded-xl resize-none border focus-visible:ring-1 focus-visible:ring-foreground bg-muted/5"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-[#14121F]">Ton souhaité</Label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left",
                      selectedTone === tone.value 
                        ? "bg-[#F3EEFD] text-[#5B1BB8] border-[#7225E3]" 
                        : "bg-background border-border hover:border-foreground/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tone.icon className="size-4" aria-hidden="true" />
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsAiDialogOpen(false)} className="rounded-full text-xs">Annuler</Button>
            <Button onClick={handleGeneratePost} size="sm" disabled={generating || !aiPrompt} className="rounded-full px-6 bg-[#7225E3] hover:bg-[#5B1BB8] text-white text-xs">
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
