"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  { value: "professionnel", label: "Professionnel", icon: "💼" },
  { value: "storytelling", label: "Storytelling", icon: "📖" },
  { value: "viral", label: "Viral", icon: "🚀" },
  { value: "educatif", label: "Éducatif", icon: "🎓" },
  { value: "conversationnel", label: "Conversationnel", icon: "💬" },
];

export default function ComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const dateParam = searchParams.get("date");

  const [postId, setPostId] = useState<string | null>(idParam);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("professionnel");
  const [generating, setGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
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

    const fetchPost = async (id: string) => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.post) {
          setContent(data.post.content || "");
          setSelectedPlatforms(data.post.platforms || []);
          if (data.post.scheduledAt) {
            setScheduledAt(new Date(data.post.scheduledAt));
          }
          if (data.post.mediaUrls) {
            setMediaFiles(data.post.mediaUrls.map((url: string, i: number) => ({
              url,
              fileId: `existing-${i}`,
              name: `Media ${i + 1}`
            })));
          }
          lastSavedRef.current = JSON.stringify({ 
            content: data.post.content, 
            platforms: data.post.platforms, 
            mediaUrls: data.post.mediaUrls 
          });
        }
      } catch (err) {
        toast.error("Failed to load post data");
      }
    };

    if (idParam) {
      fetchPost(idParam);
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
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Autosave error:", err);
      setSaveStatus("error");
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

      toast.success(isDraft ? "Draft saved!" : (postId ? "Post updated!" : "Post scheduled successfully!"));
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
          action: "generer",
          platform: selectedPlatforms[0],
          tone: selectedTone 
        }),
      });
      const data = await res.json();
      if (data.result) {
        setContent(data.result);
        setIsAiDialogOpen(false);
        setAiPrompt("");
        toast.success("Post content generated!");
      }
    } catch (err) {
      toast.error("AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1300px] mx-auto w-full pb-16">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Compose Post</h1>
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
                  {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved to DB" : "Error saving"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-sm text-muted-foreground">Create and schedule your social content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePost(true)}
            disabled={loading}
            className="h-8 px-3 rounded-lg font-medium text-muted-foreground hover:text-foreground transition-all text-xs"
          >
            <Save className="size-3.5 mr-1.5" /> Save Draft
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
            {scheduledAt ? "Schedule Post" : "Post Now"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left Column: Composition Sections */}
        <div className="space-y-4">
          {/* Platforms Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Platforms</h3>
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
            />
          </div>

          {/* Media Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Media</h3>
            <MediaUploader 
              mediaFiles={mediaFiles} 
              selectedPlatforms={selectedPlatforms}
              onUpload={(file) => setMediaFiles([...mediaFiles, file])}
              onRemove={(id) => setMediaFiles(mediaFiles.filter(f => f.fileId !== id))}
              onTransform={(id, newUrl) => setMediaFiles(mediaFiles.map(f => f.fileId === id ? { ...f, url: newUrl } : f))}
            />
          </div>

          {/* Schedule Card */}
          <div className="bg-background rounded-xl border border-border/60 shadow-sm p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Schedule</h3>
            <SchedulePicker 
              scheduledAt={scheduledAt} 
              onChange={setScheduledAt} 
            />
          </div>

          {/* Bottom Smart Action Button */}
          <div className="flex justify-end pt-2">
             <Button 
              onClick={() => handlePost(false)} 
              disabled={loading || !content.trim()} 
              size="sm"
              className="rounded-lg font-bold px-10 h-10 shadow-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {scheduledAt ? "Schedule Post" : "Post Now"}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <aside className="sticky top-20 space-y-3">
          <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest px-2">Post Preview</h3>
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
              AI Post Generator
            </DialogTitle>
            <DialogDescription className="text-xs">
              Describe what you want to post about and Gemini will craft a perfect caption for you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prompt</Label>
              <Textarea 
                placeholder="e.g. Write a post about our new AI feature launch..."
                className="min-h-[100px] rounded-xl resize-none border focus-visible:ring-1 focus-visible:ring-foreground bg-muted/5"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Desired Tone</Label>
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
            <Button variant="outline" size="sm" onClick={() => setIsAiDialogOpen(false)} className="rounded-lg text-xs">Cancel</Button>
            <Button onClick={handleGeneratePost} size="sm" disabled={generating || !aiPrompt} className="rounded-lg px-6 bg-foreground text-background text-xs">
              {generating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
              Generate Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
