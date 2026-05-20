'use client';

import { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { DisconnectButton } from './disconnect-button';
import { CanvaIcon } from '@/components/platform-icons';

interface Account {
  id: string;
  platform: string;
  username: string;
  avatarUrl?: string | null;
  isCanva?: boolean;
}

interface Platform {
  id: string;
  name: string;
  comingSoon?: boolean;
}

interface PlatformCardContentProps {
  platform: Platform;
  initialAccounts: Account[];
  maxAccounts: number;
  isCanva: boolean;
  canvaTestMode: boolean;
  canvaEnabled: boolean;
}

export function PlatformCardContent({
  platform,
  initialAccounts,
  maxAccounts,
  isCanva,
  canvaTestMode,
  canvaEnabled,
}: PlatformCardContentProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const connected = initialAccounts.length > 0;
  const activeAccount = initialAccounts[selectedIdx] || initialAccounts[0] || null;
  const isActive = selectedIdx < maxAccounts;

  const username = activeAccount
    ? (activeAccount.isCanva
      ? 'Canva Pro'
      : (platform.id === 'facebook'
        ? (activeAccount.username || 'Facebook Connecté')
        : platform.id === 'instagram'
          ? (activeAccount.username ? `@${activeAccount.username.replace('@', '')}` : 'Instagram Connecté')
          : (activeAccount.username ? (activeAccount.username.startsWith('@') ? activeAccount.username : `@${activeAccount.username}`) : 'Compte connecté')))
    : '';

  const subtitle = activeAccount
    ? (activeAccount.isCanva
      ? 'Design & Créatif'
      : !isActive
        ? 'Disponible avec le plan Business'
        : (platform.id === 'facebook'
          ? 'Meta Account'
          : platform.id === 'instagram'
            ? 'Meta Account'
            : 'Compte professionnel'))
    : '';

  return (
    <div className="flex flex-col flex-1 justify-between">
      <CardContent className="pb-4 flex-1">
        <div className="flex flex-col space-y-4 min-h-[140px] justify-center">
          {connected ? (
            <div className="space-y-4 w-full">
              {/* Tabs selector if multiple accounts connected */}
              {initialAccounts.length > 1 && (
                <div className="flex bg-muted p-1 rounded-xl text-[11px] border border-border/20 shadow-inner">
                  {initialAccounts.map((acc, idx) => {
                    const accActive = idx < maxAccounts;
                    const cleanUsername = acc.username
                      ? (acc.username.startsWith('@') ? acc.username : `@${acc.username}`)
                      : `Compte ${idx + 1}`;
                    return (
                      <button
                        key={acc.id || idx}
                        type="button"
                        onClick={() => setSelectedIdx(idx)}
                        className={cn(
                          'flex-1 py-1.5 px-2 rounded-lg font-bold transition-all duration-200 truncate flex items-center justify-center gap-1.5',
                          selectedIdx === idx
                            ? 'bg-background text-foreground shadow-sm border border-border/10'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <span className="truncate">{cleanUsername}</span>
                        {!accActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected Account Details */}
              {activeAccount && (
                <div className={cn(
                  'flex flex-col items-center text-center p-5 rounded-2xl border border-border/30 bg-muted/5 transition-all duration-300 relative overflow-hidden',
                  !isActive && 'border-amber-500/20 bg-amber-500/[0.02] opacity-75'
                )}>
                  <Avatar className="h-14 w-14 border-4 border-background shadow-md flex-shrink-0 mb-3 animate-in zoom-in-50 duration-300">
                    {activeAccount.isCanva ? (
                      <CanvaIcon className="h-full w-full" />
                    ) : (
                      <>
                        <AvatarImage src={activeAccount.avatarUrl || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                          {activeAccount.username?.charAt(0).toUpperCase() || platform.name.charAt(0)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div className="space-y-1 w-full px-2">
                    <div className="flex items-center justify-center gap-1.5 min-w-0">
                      <p className="text-sm font-bold truncate leading-tight max-w-[85%] text-foreground">
                        {username}
                      </p>
                      {!isActive && (
                        <Badge variant="outline" className="text-[9px] h-4 py-0 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-bold">
                          Suspendu
                        </Badge>
                      )}
                    </div>
                    <p className={cn('text-xs truncate', !isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-muted-foreground')}>
                      {subtitle}
                    </p>
                  </div>

                  {!isActive && (
                    <div className="mt-3 text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 leading-normal w-full">
                      Passe au plan Business pour réactiver ce compte
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6 px-4 border-2 border-dashed border-border/40 rounded-2xl bg-muted/[0.01] flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                {isCanva
                  ? 'Crée tes visuels Canva directement depuis Creatabl et attache-les à tes posts.'
                  : platform.comingSoon
                    ? 'Nous travaillons pour intégrer ce réseau prochainement.'
                    : `Gère ta présence sur ${platform.name} directement depuis Creatabl.`}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Buttons at the bottom */}
      {!platform.comingSoon && (
        <div className="p-6 pt-0 border-t border-border/10 flex flex-col space-y-3">
          {connected && activeAccount && (
            <DisconnectButton
              platformId={platform.id}
              accountId={activeAccount.isCanva ? undefined : activeAccount.id}
              isCanva={activeAccount.isCanva}
            />
          )}

          {(!isCanva && (initialAccounts.length === 0 || (maxAccounts > 1 && initialAccounts.length < maxAccounts))) && (
            <Link
              href={`/api/oauth/${platform.id}`}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'w-full shadow-sm gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary h-9 rounded-xl font-semibold'
              )}
            >
              <Plus className="h-4 w-4" />
              {initialAccounts.length > 0 ? 'Ajouter un compte' : 'Connecter un compte'}
            </Link>
          )}

          {isCanva && !connected && (
            <Link
              href="/api/canva/auth"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'w-full shadow-sm h-9 rounded-xl font-semibold border-none text-white transition-all bg-[#00C4CC] hover:bg-[#00C4CC]/90'
              )}
            >
              Connecter
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
