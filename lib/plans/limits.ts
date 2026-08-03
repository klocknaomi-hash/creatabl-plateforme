export const PLAN_LIMITS = {
  free: {
    postsPerMonth: 20,
    connectedAccounts: 1,
    aiGenerations: 20,
    teamMembers: 1,
    storageLimit: 50, // MB
  },
  starter: {
    postsPerMonth: 30,
    connectedAccounts: 3,
    aiGenerations: 30,
    teamMembers: 3,
    storageLimit: 100, // MB
  },
  pro: {
    postsPerMonth: 120,
    connectedAccounts: 15,
    aiGenerations: 120,
    teamMembers: 10,
    storageLimit: 5120, // 5GB in MB
  },
  business: {
    postsPerMonth: -1, // -1 means unlimited
    connectedAccounts: -1,
    aiGenerations: -1,
    teamMembers: -1,
    storageLimit: 20480, // 20GB in MB
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type LimitType = keyof typeof PLAN_LIMITS['free'];

