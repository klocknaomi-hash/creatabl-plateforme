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

export const metadata: Metadata = {
  title: 'Connected Accounts | Creatabl.ia',
  description: 'Manage your connected social media accounts.',
};

// ─────────────────────────────────────────────────────────────────────────────

interface PlatformInfo {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
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
];

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const connectedAccounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, user.id));

  const { allowed, current, limit } = await checkPlanLimit(user.clerkId, 'socialAccounts');
  const limitReached = !allowed;

  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Connected Accounts</h1>
        <p className="text-muted-foreground">
          Connect your social media profiles to start scheduling and automating your content.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          Successfully connected your account!
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          Error: {decodeURIComponent(error)}
        </div>
      )}

      {limitReached && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Limit Reached</AlertTitle>
          <AlertDescription>
            You have connected {current} of your {limit} accounts. 
            <Link href="/dashboard/billing" className="ml-1 font-semibold underline">Upgrade to Pro</Link> to connect more.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const connected = connectedAccounts.find((a: any) => a.platform === platform.id);
          const Icon = platform.icon;

          return (
            <Card key={platform.id} className={`group relative overflow-hidden transition-all hover:shadow-md border-border/50 ${platform.comingSoon ? 'opacity-75' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${platform.bgColor} ${platform.color} transition-transform group-hover:scale-110 flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {platform.name}
                    </CardTitle>
                    {platform.comingSoon && (
                      <Badge variant="secondary" className="text-[10px] h-4 py-0 leading-none">Coming Soon</Badge>
                    )}
                  </div>
                </div>
                {connected ? (
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none px-2 py-0.5">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none px-2 py-0.5">
                    Not Connected
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="min-h-[40px] flex items-center">
                    {connected ? (
                      <div className="flex items-center space-x-3 w-full">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={connected.avatarUrl || ''} />
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {connected.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">
                            {typeof connected.username === 'string' ? connected.username : 'Connected Account'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {typeof connected.platformUserId === 'string' ? connected.platformUserId : ''}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {platform.comingSoon 
                          ? 'We are working on bringing this integration to you.' 
                          : `Manage your ${platform.name} presence directly from Creatabl.`}
                      </p>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    {connected ? (
                      <DisconnectButton platformId={platform.id} />
                    ) : platform.comingSoon ? (
                      <div className="h-9 flex items-center justify-center rounded-md bg-muted/30 border border-dashed border-border/50">
                        <p className="text-[11px] text-muted-foreground font-medium italic">
                          We are working on bringing this integration to you.
                        </p>
                      </div>
                    ) : (
                      <Link 
                        href={limitReached ? "#" : `/api/oauth/${platform.id}`}
                        className={cn(
                          buttonVariants({ size: 'sm' }), 
                          "w-full shadow-sm",
                          limitReached && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Account
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
