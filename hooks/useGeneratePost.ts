// hooks/useGeneratePost.ts
import { useState } from "react";
import { GenerateAction, AIProvider, PostPlatform, PostTone } from "@/lib/ai-provider";

interface UseGeneratePostOptions {
  onSuccess?: (result: string) => void;
  onError?: (error: string) => void;
}

interface GenerateParams {
  content: string;
  action: GenerateAction;
  platform?: PostPlatform;
  tone?: PostTone;
  provider?: AIProvider;
}

export function useGeneratePost(options?: UseGeneratePostOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function generate(params: GenerateParams) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération");
      }

      setResult(data.result);
      options?.onSuccess?.(data.result);
      return data.result as string;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      options?.onError?.(message);
      return null;

    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { generate, loading, error, result, reset };
}
