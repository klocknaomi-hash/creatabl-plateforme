"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// « Générer une semaine » : crée 5 brouillons datés du lundi au vendredi suivants.
export function GenerateWeekButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/generate-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "La génération a échoué.");
      const week = new Date(data.weekOf).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      toast.success(`${data.created} brouillons créés pour la semaine du ${week}`, {
        description: "Relisez-les, puis programmez ceux qui vous plaisent.",
        action: { label: "Voir le calendrier", onClick: () => router.push("/dashboard/calendar") },
      });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "La génération a échoué.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={run}
      loading={loading}
      variant={variant === "primary" ? "default" : "outline"}
      className={variant === "primary" ? "h-11 px-5 bg-[image:var(--gradient-cta)] hover:bg-[#7225E3] hover:bg-none" : "h-11 px-5"}
    >
      {!loading && <Sparkles className="size-[18px]" />}
      {loading ? "Génération…" : "Générer une semaine"}
    </Button>
  );
}
