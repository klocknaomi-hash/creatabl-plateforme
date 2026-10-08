import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
  ) {
    console.error('WARNING: Using Stripe test mode in production');
    return Response.json(
      { error: 'Payment system not properly configured' },
      { status: 500 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const plan = req.nextUrl.searchParams.get('plan') || 'starter';
  const billing = req.nextUrl.searchParams.get('billing') || 'monthly';

  // Update user's selected plan in DB
  let trialEndsAt: Date | null = null;
  try {
    const [dbUser] = await db.update(users)
      .set({ selectedPlan: plan })
      .where(eq(users.clerkId, userId))
      .returning({ trialEndsAt: users.trialEndsAt });
    trialEndsAt = dbUser?.trialEndsAt ?? null;
  } catch (err) {
    console.error('Error updating selectedPlan in create-checkout:', err);
  }

  // Un seul essai par compte : l'essai démarre à l'inscription. Stripe ne
  // facture qu'à sa fin s'il reste des jours (Stripe exige au moins 48 h) ;
  // après l'essai, ou pour un compte Free, le paiement est immédiat.
  const minTrialEnd = Date.now() + 48 * 60 * 60 * 1000;
  const trialEnd =
    trialEndsAt && trialEndsAt.getTime() > minTrialEnd
      ? Math.floor(trialEndsAt.getTime() / 1000)
      : undefined;

  // Lookup key format: "starter_monthly", "pro_yearly", etc.
  const lookupKey = `${plan}_${billing}`;

  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    expand: ['data.product'],
  });

  if (!prices.data.length) {
    return NextResponse.json(
      { error: `No price found for key: ${lookupKey}` },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    payment_method_collection: 'always',
    line_items: [{ price: prices.data[0].id, quantity: 1 }],
    subscription_data: {
      ...(trialEnd ? { trial_end: trialEnd } : {}),
      metadata: { userId, plan, billing },
    },
    success_url: `https://app.creatabl-ia.com/dashboard`,
    cancel_url: `https://creatabl-ia.com/tarifs`,
    metadata: { userId, plan, billing },
  });

  return NextResponse.redirect(session.url!);
}
