'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DisconnectButtonProps {
  platformId: string;
}

export function DisconnectButton({ platformId }: DisconnectButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    setIsPending(true);
    try {
      const response = await fetch(`/api/oauth/${platformId}/disconnect`, {
        method: 'POST',
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(`Erreur: ${data.error || 'Échec de la déconnexion'}`);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Une erreur inattendue est survenue.');
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex gap-2">
        <button 
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
          className="flex-1 h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-all hover:bg-muted disabled:opacity-50"
        >
          Annuler
        </button>
        <button 
          type="button"
          onClick={handleDisconnect}
          disabled={isPending}
          className="flex-1 h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-destructive/20 bg-destructive text-destructive-foreground px-2.5 text-[0.8rem] font-medium transition-all hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmer'}
        </button>
      </div>
    );
  }

  return (
    <button 
      type="button"
      onClick={() => setIsConfirming(true)}
      className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-[min(var(--radius-md),12px)] border border-destructive/20 bg-background px-2.5 text-[0.8rem] font-medium text-destructive transition-all hover:bg-destructive/5 hover:border-destructive/30"
    >
      <Trash2 className="mr-2 h-3.5 w-3.5" />
      Supprimer
    </button>
  );
}
