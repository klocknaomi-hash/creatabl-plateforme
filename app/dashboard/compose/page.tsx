"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles,
  Send,
  Calendar,
  Save,
  Loader2,
  Wand2
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

interface MediaFile {
  url: string;
  fileId: string;
  name: string;
}

export default function ComposePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  // Handle Query Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    const idParam = params.get("id");

    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        // Set time to a default (e.g., 9:00 AM) if it's just a date
        if (date.getHours() === 0 && date.getMinutes() === 0) {
          date.setHours(9, 0, 0, 0);
        }
        setScheduledAt(date);
      }
    }

    if (idParam) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`/api/posts/${idParam}`);
          const data = await res.json();
          if (data.post) {
            setContent(data.post.content);
            setSelectedPlatforms(data.post.platforms);
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
          }
        } catch (err) {
          toast.error("Failed to load post data");
        }
      };
      fetchPost();
    } else {
      // Only restore from localStorage if not editing a specific post
      const saved = localStorage.getItem("creatabl_compose_draft");
      if (saved) {
        try {
          const { content: c, selectedPlatforms: sp, mediaFiles: mf } = JSON.parse(saved);
          if (c) setContent(c);
          if (sp) setSelectedPlatforms(sp);
          if (mf) setMediaFiles(mf);
        } catch (e) {}
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("id")) {
      localStorage.setItem("creatabl_compose_draft", JSON.stringify({
        content,
        selectedPlatforms,
        mediaFiles
      }));
    }
  }, [content, selectedPlatforms, mediaFiles]);

  const handlePost = async (isDraft = false) => {
    if (!content && mediaFiles.length === 0) {
      return toast.error("Please add some content or media");
    }
    if (selectedPlatforms.length === 0 && !isDraft) {
      return toast.error("Please select at least one platform");
    }

    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      const url = id ? `/api/posts/${id}` : "/api/posts";
      const method = id ? "PATCH" : "POST";

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

      toast.success(isDraft ? "Draft saved!" : (id ? "Post updated!" : "Post scheduled successfully!"));
      localStorage.removeItem("creatabl_compose_draft");
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
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, platforms: selectedPlatforms }),
      });
      const data = await res.json();
      if (data.generated) {
        setContent(data.generated);
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compose Post</h1>
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
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">Caption</h3>
            <CaptionEditor 
              content={content} 
              onChange={setContent} 
              selectedPlatforms={selectedPlatforms} 
              onOpenAiDialog={() => setIsAiDialogOpen(true)}
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
              {scheduledAt ? "Scheduled" : "Post Now"}
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
          <div className="py-2">
            <Textarea 
              placeholder="e.g. Write a post about our new AI feature launch..."
              className="min-h-[100px] rounded-xl resize-none border focus-visible:ring-1 focus-visible:ring-foreground"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
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
