export const PLAN_LIMITS = {
  free: {
    postsPerMonth: 20,
    connectedAccounts: 1,
    aiGenerations: 20,
    teamMembers: 1,
    workspaces: 1,
  },
  starter: {
    postsPerMonth: 30,
    connectedAccounts: 3,
    aiGenerations: 30,
    teamMembers: 1,
    workspaces: 1,
  },
  pro: {
    postsPerMonth: 120,
    connectedAccounts: 15,
    aiGenerations: 120,
    teamMembers: 1,
    workspaces: 3,
  },
  business: {
    postsPerMonth: -1, // -1 means unlimited
    connectedAccounts: -1,
    aiGenerations: -1,
    teamMembers: -1,
    workspaces: 5,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type LimitType = keyof typeof PLAN_LIMITS['free'];
