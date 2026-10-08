// Source unique des quotas par plan. Le reste du code (accès, API, interface)
// lit ces valeurs au lieu de les recopier.
//
// postsPerMonth = crédits du mois : 1 crédit = 1 post programmé ou publié.
// Les brouillons et les posts en échec ne consomment pas de crédit.
// -1 signifie illimité.
export const PLAN_LIMITS = {
  free: {
    postsPerMonth: 20,
    connectedAccounts: 1,
    aiGenerations: 20,
    teamMembers: 1,
    storageLimit: 50, // MB
  },
  starter: {
    postsPerMonth: 50,
    connectedAccounts: 3,
    aiGenerations: 50,
    teamMembers: 3,
    storageLimit: 100, // MB
  },
  pro: {
    postsPerMonth: 120,
    connectedAccounts: 15,
    aiGenerations: -1,
    teamMembers: 10,
    storageLimit: 5120, // 5GB in MB
  },
  business: {
    postsPerMonth: 300,
    connectedAccounts: -1,
    aiGenerations: -1,
    teamMembers: -1,
    storageLimit: 20480, // 20GB in MB
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type LimitType = keyof typeof PLAN_LIMITS['free'];

// Ramène la valeur stockée en base (anciens noms compris) à un plan connu.
export function normalizePlan(plan?: string | null): PlanType {
  const value = (plan || 'free').toLowerCase();
  if (value === 'agency') return 'business';
  return value in PLAN_LIMITS ? (value as PlanType) : 'free';
}
