"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, ImagePlus, Search } from "lucide-react";
import { toast } from "sonner";
import { CanvaIcon } from "@/components/platform-icons";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");
  
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
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden bg-background">
        <div className="p-6 border-b bg-background z-10 flex-shrink-0">
          <DialogHeader className="flex flex-row items-center justify-between mb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <CanvaIcon size={28} />
              Mes designs Canva
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={fetchDesigns} disabled={loading}>
                <RefreshCcw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </DialogHeader>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un design..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-muted/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
        
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
        ) : (() => {
          const filteredDesigns = designs.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()));
          
          if (filteredDesigns.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <p className="text-sm text-muted-foreground">Aucun design ne correspond à votre recherche.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDesigns.map(design => {
                const thumbnailUrl = design.thumbnail?.url || design.urls?.thumbnail;
                
                return (
                  <div key={design.id} className="group flex flex-col gap-3">
                    <div className="relative rounded-2xl border border-border/50 bg-background shadow-sm overflow-hidden aspect-[4/3] transition-all group-hover:shadow-md group-hover:border-[#00C4CC]/50">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={design.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                          <CanvaIcon className="w-10 h-10 opacity-20" />
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                        <Button 
                          className="bg-[#00C4CC] hover:bg-[#00C4CC]/90 text-white shadow-lg font-bold px-6"
                          disabled={exportingId !== null}
                          onClick={() => handleExport(design.id)}
                        >
                          {exportingId === design.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Exportation...
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-4 h-4 mr-2" />
                              Importer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="px-1">
                      <p className="text-sm font-semibold truncate text-foreground/90">{design.title || "Design sans titre"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Mis à jour {new Date(design.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
