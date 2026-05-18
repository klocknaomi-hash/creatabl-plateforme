import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2,
  Plus,
  Palette
} from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { checkPlanLimit } from '@/lib/plan-limits';
import { PlanGate } from '@/components/billing/plan-gate';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  InstagramIcon, 
  LinkedinIcon, 
  FacebookIcon, 
  TwitterIcon,
  YoutubeIcon,
  TiktokIcon,
  PinterestIcon
} from '@/components/platform-icons';
import { DisconnectButton } from './disconnect-button';
import { PlatformCardContent } from './platform-card-content';

export const metadata: Metadata = {
  title: 'Comptes connectés | Creatabl.ia',
  description: 'Gérez vos comptes connectés.',
};

// ─────────────────────────────────────────────────────────────────────────────

interface PlatformInfo {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
  isIntegration?: boolean;
}

const PLATFORMS: PlatformInfo[] = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: InstagramIcon, 
    color: 'text-[#E4405F]', 
    bgColor: 'bg-[#E4405F]/10' 
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: LinkedinIcon, 
    color: 'text-[#0A66C2]', 
    bgColor: 'bg-[#0A66C2]/10' 
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: FacebookIcon, 
    color: 'text-[#1877F2]', 
    bgColor: 'bg-[#1877F2]/10' 
  },
  { 
    id: 'twitter', 
    name: 'Twitter / X', 
    icon: TwitterIcon, 
    color: 'text-[#000000] dark:text-white', 
    bgColor: 'bg-black/5 dark:bg-white/10',
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: YoutubeIcon, 
    color: 'text-[#FF0000]', 
    bgColor: 'bg-[#FF0000]/10',
    comingSoon: true
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: TiktokIcon, 
    color: 'text-[#000000] dark:text-white', 
    bgColor: 'bg-black/5 dark:bg-white/10',
    comingSoon: true 
  },
  { 
    id: 'pinterest', 
    name: 'Pinterest', 
    icon: PinterestIcon, 
    color: 'text-[#BD081C]', 
    bgColor: 'bg-[#BD081C]/10',
    comingSoon: true 
  },
  {
    id: 'canva',
    name: 'Canva',
    icon: Palette,
    color: 'text-[#00C4CC]',
    bgColor: 'bg-[#00C4CC]/10',
    isIntegration: true
  }
];

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; facebook?: string }>;
}) {
  const { success, error, facebook } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  let connectedAccounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, user.id));

  // Migrate legacy accounts on the fly for the server component too!
  let needsRefetch = false;
  if (user.facebookAccessToken && !connectedAccounts.some(a => a.platform === 'facebook')) {
    try {
      const { encrypt, decrypt } = await import('@/lib/crypto');
      await db.insert(socialAccounts).values({
        userId: user.id,
        platform: 'facebook',
        platformUserId: user.facebookUserId,
        accessToken: encrypt(decrypt(user.facebookAccessToken)),
        username: user.name || 'Facebook User',
      });
      needsRefetch = true;
    } catch (err) {
      console.error('Failed to migrate legacy Facebook account:', err);
    }
  }

  if (user.instagramAccountId && !connectedAccounts.some(a => a.platform === 'instagram')) {
    try {
      const { encrypt, decrypt } = await import('@/lib/crypto');
      await db.insert(socialAccounts).values({
        userId: user.id,
        platform: 'instagram',
        platformUserId: user.instagramAccountId,
        accessToken: user.facebookAccessToken ? encrypt(decrypt(user.facebookAccessToken)) : null,
        username: user.name || 'Instagram User',
      });
      needsRefetch = true;
    } catch (err) {
      console.error('Failed to migrate legacy Instagram account:', err);
    }
  }

  if (needsRefetch) {
    connectedAccounts = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, user.id));
  }

  const { getTrialStatus } = await import('@/lib/trial');
  const trialStatus = getTrialStatus({
    trialStartedAt: user.trialStartedAt,
    trialEndsAt: user.trialEndsAt,
    isSubscribed: user.isSubscribed || false,
  });

  const isTrialActive = trialStatus.status === 'trial';
  const plan = isTrialActive 
    ? 'business' 
    : ((user.plan || user.selectedPlan || 'starter') as string);

  const maxAccounts = (plan === 'business' || plan === 'agency') ? 2 : 1;

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Comptes connectés</h1>
          <p className="text-muted-foreground">
            Connecte tes comptes pour programmer et automatiser ton contenu.
          </p>
        </div>
        <div className="inline-flex items-center rounded-xl bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
          {plan === 'business' || plan === 'agency' ? 'Plan Business : Jusqu’à 2 comptes par réseau' : 'Plan Starter/Pro : 1 compte par réseau'}
        </div>
      </div>

      {isTrialActive && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl text-sm font-semibold flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Essai gratuit : accès Business</span>
          </div>
          <span className="text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">
            {trialStatus.daysLeft} jour{trialStatus.daysLeft && trialStatus.daysLeft > 1 ? "s" : ""} restant{trialStatus.daysLeft && trialStatus.daysLeft > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {(success || facebook === 'connected') && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          Compte connecté avec succès !
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          Error: {decodeURIComponent(error)}
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const isCanva = platform.id === 'canva';
          const canvaEnabled = process.env.NEXT_PUBLIC_CANVA_ENABLED === 'true';
          const canvaTestMode = process.env.NEXT_PUBLIC_CANVA_TEST_MODE === 'true';
          const isCanvaAccessible = isCanva && (canvaEnabled || canvaTestMode);
          
          const platformAccounts = isCanva 
            ? (user.canvaAccessToken ? [{ id: 'canva', username: 'Canva Pro', avatarUrl: null, isCanva: true }] : [])
            : connectedAccounts.filter((a: any) => a.platform === platform.id);
          
          const connected = platformAccounts.length > 0;
          const Icon = platform.icon;

          if (isCanva && !isCanvaAccessible && !canvaEnabled) {
            platform.comingSoon = true;
          }

          const hasSuspendedAccounts = !isCanva && platformAccounts.some((_, idx) => idx >= maxAccounts);

          return (
            <Card key={platform.id} className={cn(
              "group relative overflow-hidden transition-all hover:shadow-md border-border/50 flex flex-col justify-between",
              platform.comingSoon && "opacity-60 bg-muted/20 border-dashed"
            )}>
              <div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2.5 rounded-xl transition-transform group-hover:scale-110 flex items-center justify-center",
                      platform.bgColor,
                      platform.color
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {platform.name}
                      </CardTitle>
                    </div>
                  </div>
                  {platform.comingSoon ? (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground/60 border-none px-2 py-0.5">
                      Bientôt disponible
                    </Badge>
                  ) : connected ? (
                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none px-2 py-0.5">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connecté
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none px-2 py-0.5">
                      Non connecté
                    </Badge>
                  )}
                </CardHeader>
              </div>

              <PlatformCardContent
                platform={platform}
                initialAccounts={platformAccounts as any}
                maxAccounts={maxAccounts}
                isCanva={isCanva}
                canvaTestMode={canvaTestMode}
                canvaEnabled={canvaEnabled}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
