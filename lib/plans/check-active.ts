import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isNaomiOrTest } from "./index";

export async function checkActiveAccess(clerkId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) return { allowed: false, reason: "user_not_found" };

  const isTest = isNaomiOrTest(user.email) || user.email.endsWith('@creatabl-ia.com');
  if (isTest) return { allowed: true };

  // If plan is Free, they have access to free limits
  if (user.plan === 'free') return { allowed: true };

  // Check trial
  const now = new Date();
  const trialActive = user.trialEndsAt && new Date(user.trialEndsAt) > now;

  // Check subscription
  const hasSubscription = user.stripeSubscriptionId != null && 
    (user.subscriptionStatus === 'active' || 
     user.subscriptionStatus === 'trialing' || 
     user.subscriptionStatus === 'canceling');

  if (!trialActive && !hasSubscription) {
    return { allowed: false, reason: "trial_expired" };
  }

  return { allowed: true };
}
