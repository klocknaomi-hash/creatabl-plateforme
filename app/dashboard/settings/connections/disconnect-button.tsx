'use client';

import { useState } from 'react';
import { Link2Off } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ds/confirm';

interface DisconnectButtonProps {
  platformId: string;
  accountId?: string;
  isCanva?: boolean;
}

// Déconnexion d'un compte : bouton destructif doux, puis confirmation (design system).
export function DisconnectButton({ platformId, accountId, isCanva }: DisconnectButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const confirmDialog = useConfirm();

  async function handleDisconnect() {
    const ok = await confirmDialog({
      title: isCanva ? 'Se déconnecter de Canva ?' : 'Déconnecter ce compte ?',
      description: isCanva
        ? 'Vous ne pourrez plus importer vos designs Canva tant que vous ne vous reconnectez pas.'
        : 'Les posts programmés sur ce compte ne pourront plus être publiés tant que vous ne le reconnectez pas.',
      confirmLabel: 'Déconnecter',
    });
    if (!ok) return;

    setIsPending(true);
    try {
      const response = await fetch(`/api/oauth/${platformId}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (response.ok) {
        toast.success(isCanva ? 'Canva est déconnecté' : 'Compte déconnecté');
        router.refresh();
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Échec de la déconnexion');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Une erreur inattendue est survenue.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button type="button" variant="destructive-soft" className="w-full" loading={isPending} onClick={handleDisconnect}>
      {!isPending && <Link2Off className="size-4" />}
      {isPending ? 'Déconnexion…' : isCanva ? 'Se déconnecter de Canva' : 'Se déconnecter du compte'}
    </Button>
  );
}
