export type Plan = 'starter' | 'pro' | 'business'

export type PlanAccess = {
  // IA
  aiBasic: boolean
  aiAdvanced: boolean
  aiReformulate: boolean
  aiTone: boolean
  aiSuggestions: boolean

  // Analytics
  analyticsBasic: boolean
  analyticsAdvanced: boolean

  // Accounts & team
  multiAccounts: boolean
  maxAccounts: number
  team: boolean

  // Posts
  maxPostsPerMonth: number

  // Integrations
  canvaIntegration: boolean
}

export const PLAN_CONFIG: Record<Plan, PlanAccess> = {
  starter: {
    aiBasic: true,
    aiAdvanced: false,
    aiReformulate: false,
    aiTone: false,
    aiSuggestions: false,
    analyticsBasic: true,
    analyticsAdvanced: false,
    multiAccounts: false,
    maxAccounts: 1,
    team: false,
    maxPostsPerMonth: 30,
    canvaIntegration: true,
  },
  pro: {
    aiBasic: true,
    aiAdvanced: true,
    aiReformulate: true,
    aiTone: true,
    aiSuggestions: true,
    analyticsBasic: true,
    analyticsAdvanced: true,
    multiAccounts: false,
    maxAccounts: 1,
    team: false,
    maxPostsPerMonth: 120,
    canvaIntegration: true,
  },
  business: {
    aiBasic: true,
    aiAdvanced: true,
    aiReformulate: true,
    aiTone: true,
    aiSuggestions: true,
    analyticsBasic: true,
    analyticsAdvanced: true,
    multiAccounts: true,
    maxAccounts: 5,
    team: true,
    maxPostsPerMonth: 300,
    canvaIntegration: true,
  },
}

export function getPlanAccess(plan: string): PlanAccess {
  const validPlan = (plan as Plan) in PLAN_CONFIG
    ? (plan as Plan)
    : 'starter'
  return PLAN_CONFIG[validPlan]
}

export function isNaomiOrTest(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized === 'klock.naomi@gmail.com' || 
         normalized === 'klocknaomi@gmail.com' || 
         normalized.endsWith('-test@creatabl-ia.com');
}
