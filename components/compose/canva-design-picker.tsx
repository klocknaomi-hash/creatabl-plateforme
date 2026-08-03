"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CanvaIcon } from "@/components/platform-icons";

interface CanvaDesign {
  id: string;
  title: string;
  thumbnail?: { url: string };
  urls?: { thumbnail?: string; edit_url?: string; view_url?: string };
  updated_at: string;
}

interface CanvaDesignPickerProps {
  children: React.ReactNode;
  onUpload: (file: { url: string; fileId: string; name: string }) => void;
}

export function CanvaDesignPicker({ children, onUpload }: CanvaDesignPickerProps) {
  const [open, setOpen] = useState(false);
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchDesigns();
    }
  }, [open]);

  const fetchDesigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/canva/designs");
      if (!res.ok) {
        if (res.status === 401) {
          setError("auth");
          return;
        }
        throw new Error("Failed to fetch designs");
      }
      const data = await res.json();
      setDesigns(data.items || data.designs || []);
    } catch (err: any) {
      console.error(err);
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (designId: string) => {
    setExportingId(designId);
    try {
      // 1. Start export
      const startRes = await fetch("/api/canva/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designId })
      });
      
      if (!startRes.ok) throw new Error("Échec de l'export Canva");
      
      const startData = await startRes.json();
      const jobId = startData.job?.id || startData.export?.id || startData.id;
      
      if (!jobId) throw new Error("ID d'export manquant");

      // 2. Poll for status
      let attempts = 0;
      let finalUrl = null;
      
      while (attempts < 30) { // 30 * 2s = 60s
        await new Promise(r => setTimeout(r, 2000));
        attempts++;
        
        const statusRes = await fetch(`/api/canva/export/${jobId}`);
        if (!statusRes.ok) throw new Error("Erreur de statut d'export");
        
        const statusData = await statusRes.json();
        const exportObj = statusData.job || statusData.export || statusData;
        
        if (exportObj?.status === "success" || exportObj?.status === "SUCCESS") {
          finalUrl = exportObj.urls?.[0];
          break;
        } else if (exportObj?.status === "failed" || exportObj?.status === "FAILED") {
          throw new Error("L'export Canva a échoué");
        }
      }

      if (!finalUrl) {
        throw new Error("Délai d'attente dépassé");
      }

      toast.info("Téléchargement du design...");

      // 3. Upload to our backend
      const fileRes = await fetch(finalUrl);
      const blob = await fileRes.blob();
      const file = new File([blob], `canva-${designId}.png`, { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/media/upload", { method: "POST", body: formData });
      
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "L'envoi a échoué");
      }
      
      const data = await uploadRes.json();
      onUpload({ url: data.url, fileId: data.fileId, name: data.name });
      toast.success("Design importé !");
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'import");
    } finally {
      setExportingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {React.isValidElement(children) ? (
        <DialogTrigger render={children as React.ReactElement} />
      ) : (
        <DialogTrigger>{children}</DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-8 border-b pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2">
            <CanvaIcon size={24} />
            Mes designs Canva
          </DialogTitle>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={fetchDesigns} disabled={loading} className="gap-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={loading ? "animate-spin" : ""}><path d="M1.84998 7.49998C1.84998 4.66458 4.05979 2.23981 6.89734 1.92253L6.84752 0.928323C3.40742 1.31385 0.849976 4.22596 0.849976 7.49998C0.849976 10.662 3.25054 13.5295 6.53934 14.0734L6.70274 13.0864C3.93121 12.6276 1.84998 10.2858 1.84998 7.49998ZM13.15 7.49998C13.15 10.3354 10.9402 12.7602 8.10266 13.0775L8.15248 14.0717C11.5926 13.6861 14.15 10.774 14.15 7.49998C14.15 4.33796 11.7495 1.47053 8.46066 0.926593L8.29726 1.91357C11.0688 2.37241 13.15 4.71424 13.15 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              Rafraîchir
            </Button>
            <Button 
              size="sm" 
              className="gap-2 bg-[#8B3DFF] hover:bg-[#8B3DFF]/90 text-white"
              onClick={() => window.open('https://www.canva.com/create', 'canvaEditor', 'width=1100,height=800,top=100,left=200')}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              Créer sur Canva
            </Button>
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement de vos designs...</p>
          </div>
        ) : error === "auth" ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
            <p className="text-sm text-muted-foreground">Votre connexion Canva a expiré ou est invalide.</p>
            <Button onClick={() => window.location.href = '/dashboard/settings/connections'}>
              Reconnecter Canva
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-destructive">
            <p className="text-sm">Une erreur est survenue lors du chargement des designs.</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm text-muted-foreground">Vous n'avez aucun design sur Canva.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {designs.map(design => {
              const thumbnailUrl = design.thumbnail?.url || design.urls?.thumbnail;
              
              return (
                <div key={design.id} className="group relative rounded-xl border bg-muted/20 overflow-hidden flex flex-col aspect-[4/3]">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={design.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <CanvaIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-1">
                    <p className="text-white text-[10px] font-bold text-center line-clamp-2 mb-2">{design.title}</p>
                    <div className="flex w-full gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full text-[10px] h-7 px-2"
                        onClick={() => {
                          const url = design.urls?.edit_url || design.urls?.view_url || `https://www.canva.com/design/${design.id}/edit`;
                          window.open(url, 'canvaEditor', 'width=1100,height=800,top=100,left=200');
                        }}
                      >
                        Éditer
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full text-[10px] h-7 px-2 bg-[#00C4CC] hover:bg-[#00C4CC]/90 text-white"
                        disabled={exportingId !== null}
                        onClick={() => handleExport(design.id)}
                      >
                        {exportingId === design.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Importer"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
