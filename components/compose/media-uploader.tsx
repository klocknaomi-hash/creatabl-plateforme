"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2, Sparkles, Wand2, Crop, Layers, Palette, Maximize, Scissors, RefreshCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface MediaFile {
  url: string;
  fileId: string;
  name: string;
}

interface MediaUploaderProps {
  mediaFiles: MediaFile[];
  selectedPlatforms: string[];
  onUpload: (file: MediaFile) => void;
  onRemove: (fileId: string) => void;
  onTransform: (fileId: string, newUrl: string) => void;
}

function MediaItem({ 
  file, 
  onRemove, 
  onTransform 
}: { 
  file: MediaFile, 
  onRemove: (id: string) => void, 
  onTransform: (id: string, url: string) => void,
}) {
  const [tempUrl, setTempUrl] = useState(file.url);
  const [isOpen, setIsOpen] = useState(false);

  const transformations = [
    { id: "bg-remove", label: "Remove Background", value: "e-removedotbg", icon: Scissors, color: "text-purple-500", desc: "AI background removal" },
    { id: "upscale", label: "AI Upscale", value: "e-upscale", icon: Maximize, color: "text-blue-500", desc: "Boost resolution" },
    { id: "retouch", label: "AI Retouch", value: "e-retouch", icon: Sparkles, color: "text-amber-500", desc: "AI skin & color retouch" },
    { id: "genvar", label: "AI Variations", value: "e-genvar", icon: RefreshCcw, color: "text-emerald-500", desc: "Generate variations" },
    { id: "change-bg", label: "Change Background", value: "e-changebg-prompt-", icon: Layers, color: "text-pink-500", desc: "Swap background with AI", hasPrompt: true, placeholder: "e.g. sunset beach, minimal office" },
    { id: "ai-edit", label: "AI Edit", value: "e-edit-prompt-", icon: Wand2, color: "text-indigo-500", desc: "Modify with text prompt", hasPrompt: true, placeholder: "e.g. add a coffee cup, make it vintage" },
    { id: "smart-crop", label: "Smart Crop", value: "fo-auto,w-1000,h-1000,cm-extract", icon: Crop, color: "text-slate-500", desc: "AI-powered focus" },
  ];

  const [activeTransformation, setActiveTransformation] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const applyTransformation = (t: any) => {
    const baseUrl = file.url.split("?")[0];
    if (!t.value) {
      setTempUrl(baseUrl);
      setActiveTransformation(null);
      return;
    }

    if (t.hasPrompt) {
      if (!prompt) {
        toast.error("Please enter a prompt first");
        return;
      }
      setTempUrl(`${baseUrl}?tr=${t.value}${encodeURIComponent(prompt)}`);
    } else {
      setTempUrl(`${baseUrl}?tr=${t.value}`);
    }
    setActiveTransformation(t.id);
  };

  const handleSave = () => {
    onTransform(file.fileId, tempUrl);
    setIsOpen(false);
    toast.success("Changes applied!");
  };

  const handleCancel = () => {
    setTempUrl(file.url);
    setIsOpen(false);
  };

  return (
    <div className="relative aspect-square">
      <div className="w-full h-full rounded-xl overflow-hidden border border-border/60 bg-muted/20 group">
        <img 
          src={file.url} 
          alt={file.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 z-10">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 px-4 rounded-lg font-bold gap-1.5 transition-transform hover:scale-105 active:scale-95 bg-white text-black hover:bg-white/90 border-none shadow-sm"
                >
                  Edit
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[850px] rounded-3xl p-0 overflow-hidden gap-0 border-none shadow-2xl bg-background/95 backdrop-blur-xl">
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-bold">ImageKit AI Tools</DialogTitle>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Transform with Artificial Intelligence</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                  {/* Left: Options */}
                  <div className="w-full md:w-[320px] flex flex-col bg-muted/20 p-5 border-r border-border/40 overflow-y-auto custom-scrollbar">
                    <div className="mb-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60 mb-1">AI Enhancements</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">Select a feature to enhance your media.</p>
                    </div>
                    
                    <div className="space-y-2">
                      {transformations.map((t) => (
                        <div key={t.id} className="space-y-2">
                          <button
                            onClick={() => t.hasPrompt ? setActiveTransformation(t.id) : applyTransformation(t)}
                            className={cn(
                              "w-full group flex flex-col items-start p-3 rounded-2xl transition-all text-left border border-transparent hover:border-border/60 hover:bg-background shadow-sm",
                              activeTransformation === t.id ? "bg-background border-primary/20 ring-1 ring-primary/10" : "bg-background/40"
                            )}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex items-center gap-2.5">
                                <t.icon className={cn("w-4 h-4", t.color)} />
                                <span className="text-[13px] font-bold">{t.label}</span>
                              </div>
                              {activeTransformation === t.id && !t.hasPrompt && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
                          </button>

                          {/* Prompt Input for specific transformations */}
                          {t.hasPrompt && activeTransformation === t.id && (
                            <div className="px-1 pb-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                              <textarea
                                placeholder={t.placeholder}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full h-20 p-2.5 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => applyTransformation(t)}
                                className="w-full h-8 rounded-lg text-[10px] font-bold gap-1.5"
                              >
                                <Wand2 className="w-3 h-3" /> Apply {t.label}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6 opacity-50" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-10 rounded-xl text-xs font-bold gap-2 hover:bg-destructive/5 hover:text-destructive transition-colors"
                      onClick={() => {
                        setTempUrl(file.url.split("?")[0]);
                        setActiveTransformation(null);
                        setPrompt("");
                      }}
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Reset to Original
                    </Button>
                  </div>

                  {/* Right: Preview */}
                  <div className="flex-1 bg-muted/5 p-8 flex flex-col items-center justify-center gap-6">
                    <div className="relative aspect-square w-full max-w-[450px] rounded-3xl overflow-hidden shadow-2xl border border-border/40 bg-background group">
                      <img 
                        src={tempUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Loading indicator for the image itself */}
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Processing...</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Preview Window</p>
                      <p className="text-[9px] text-muted-foreground/60 italic">AI transformations may take up to 30s to process initially</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border/40 bg-background flex justify-end gap-3">
                  <Button variant="ghost" size="sm" className="rounded-xl h-10 px-6 text-xs font-bold" onClick={handleCancel}>Cancel</Button>
                  <Button size="sm" className="rounded-xl h-10 px-8 text-xs font-bold bg-foreground text-background hover:opacity-90 shadow-lg shadow-foreground/10" onClick={handleSave}>Apply & Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top Right Remove Button - Outside */}
      <Button 
        size="icon" 
        variant="destructive" 
        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full shadow-lg z-20 hover:scale-110 active:scale-90"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(file.fileId);
        }}
      >
        <X className="w-2.5 h-2.5" />
      </Button>
    </div>
  );
}

const PLATFORM_MEDIA_LIMITS: Record<string, { max: number; size: number; types: string[] }> = {
  instagram: { max: 10, size: 100, types: ["image/jpeg", "image/png", "video/mp4", "video/quicktime"] },
  twitter: { max: 4, size: 10, types: ["image/jpeg", "image/png", "image/webp", "video/mp4"] },
  facebook: { max: 10, size: 1024, types: ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime"] },
  linkedin: { max: 9, size: 200, types: ["image/jpeg", "image/png", "video/mp4"] },
};

interface MediaLimit {
  max: number;
  size: number;
  types: string[];
}

export function MediaUploader({ mediaFiles, selectedPlatforms, onUpload, onRemove, onTransform }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStrictestLimit = (): MediaLimit => {
    if (selectedPlatforms.length === 0) return { max: 10, size: 100, types: [] };
    
    return selectedPlatforms.reduce((acc: MediaLimit, p: string) => {
      const limit = PLATFORM_MEDIA_LIMITS[p.toLowerCase()] || { max: 10, size: 100, types: [] as string[] };
      return {
        max: Math.min(acc.max, limit.max),
        size: Math.min(acc.size, limit.size),
        types: acc.types.length === 0 ? limit.types : acc.types.filter(t => limit.types.includes(t)),
      };
    }, { max: 100, size: 10000, types: [] as string[] });
  };

  const validateFile = (file: File): string | null => {
    const limits = getStrictestLimit();
    const sizeMB = file.size / (1024 * 1024);
    const fileName = file.name;
    const formattedSize = sizeMB.toFixed(1) + "MB";

    if (mediaFiles.length >= limits.max) {
      const platformNames = selectedPlatforms.join(" & ");
      return `This post has ${mediaFiles.length} media items, but ${platformNames} allows a maximum of ${limits.max}.`;
    }

    if (sizeMB > limits.size) {
      return `"${fileName}" (${formattedSize}) is too large. The limit for selected platforms is ${limits.size}MB.`;
    }

    if (limits.types.length > 0 && !limits.types.includes(file.type)) {
      return `"${fileName}" has an unsupported file type (${file.type}).`;
    }

    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      toast.error(error, { duration: 5000 });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      
      const data = await res.json();
      onUpload({ url: data.url, fileId: data.fileId, name: data.name });
      toast.success("Uploaded!");
    } catch (err: any) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* Existing Media */}
      {mediaFiles.map((file) => (
        <MediaItem 
          key={file.fileId} 
          file={file} 
          onRemove={onRemove} 
          onTransform={onTransform} 
        />
      ))}

      {/* Upload Media Tile */}
      {mediaFiles.length < 4 && (
        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "relative aspect-square rounded-xl border-2 border-dashed border-border/40 bg-muted/5 cursor-pointer transition-all flex flex-col items-center justify-center",
            "hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-sm group"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 rounded-lg bg-background border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              {uploading ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Upload className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </div>
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*,video/*"
          />
        </div>
      )}

      {/* Canva Tile */}
      <div className={cn(
        "relative aspect-square rounded-xl border border-border/40 bg-muted/20 transition-all opacity-50 grayscale cursor-not-allowed flex flex-col items-center justify-center"
      )}>
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="secondary" className="text-[7px] h-4 px-1.5 font-black uppercase tracking-wider bg-primary/10 text-primary border-2 border-background shadow-sm">
            Soon
          </Badge>
        </div>

        <div className="size-8 rounded-lg bg-background/50 border border-border/40 flex items-center justify-center">
          <Palette className="size-4 text-muted-foreground/60" />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 mt-2">Canva</span>
      </div>
    </div>
  );
}
