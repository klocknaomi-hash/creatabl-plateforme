'use client';

import { useState } from 'react';
import { Link2Off, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DisconnectButtonProps {
  platformId: string;
  accountId?: string;
  isCanva?: boolean;
}

export function DisconnectButton({ platformId, accountId, isCanva }: DisconnectButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    setIsPending(true);
    try {
      const response = await fetch(`/api/oauth/${platformId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
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
      <div className="flex gap-2 w-full animate-in fade-in duration-200">
        <button 
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
          className="flex-1 h-9 items-center justify-center rounded-xl border border-border bg-background px-3 text-xs font-semibold transition-all hover:bg-muted disabled:opacity-50"
        >
          Annuler
        </button>
        <button 
          type="button"
          onClick={handleDisconnect}
          disabled={isPending}
          className="flex-1 h-9 items-center justify-center rounded-xl border border-destructive/20 bg-destructive text-destructive-foreground px-3 text-xs font-semibold transition-all hover:bg-destructive/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" /> : 'Confirmer'}
        </button>
      </div>
    );
  }

  return (
    <button 
      type="button"
      onClick={() => setIsConfirming(true)}
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-destructive/10 bg-destructive/[0.02] px-3 text-xs font-semibold text-destructive transition-all hover:bg-destructive/5 hover:border-destructive/20"
    >
      <Link2Off className="h-3.5 w-3.5" />
      {isCanva ? "Se déconnecter de Canva" : "Se déconnecter du compte"}
    </button>
  );
}
