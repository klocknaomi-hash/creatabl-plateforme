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
  urls?: { thumbnail: string }; // Fallback depending on API structure
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CanvaIcon className="w-5 h-5" />
            Sélectionner un design Canva
          </DialogTitle>
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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                    <p className="text-white text-xs font-bold text-center line-clamp-2 mb-3">{design.title}</p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={exportingId !== null}
                      onClick={() => handleExport(design.id)}
                    >
                      {exportingId === design.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Utiliser ce design"
                      )}
                    </Button>
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
