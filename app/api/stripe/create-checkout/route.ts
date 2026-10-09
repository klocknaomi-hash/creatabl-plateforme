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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.creatabl-ia.com';

  // Update user's selected plan in DB
  let trialEndsAt: Date | null = null;
  let dbUser: typeof users.$inferSelect | undefined;
  try {
    [dbUser] = await db.update(users)
      .set({ selectedPlan: plan })
      .where(eq(users.clerkId, userId))
      .returning();
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

  // Déjà abonné : on change le plan de l'abonnement existant (avec prorata)
  // au lieu d'ouvrir un second abonnement facturé en double.
  if (dbUser?.stripeSubscriptionId) {
    try {
      const current = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId);
      if (['active', 'trialing', 'past_due'].includes(current.status)) {
        const item = current.items.data[0];
        if (item.price.id !== prices.data[0].id) {
          await stripe.subscriptions.update(current.id, {
            items: [{ id: item.id, price: prices.data[0].id }],
            proration_behavior: 'create_prorations',
            cancel_at_period_end: false,
            metadata: { userId, plan, billing },
          });
        }
        return NextResponse.redirect(new URL('/dashboard/billing?changement=ok', appUrl));
      }
    } catch (err) {
      console.error('Plan change on existing subscription failed, falling back to checkout:', err);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    payment_method_collection: 'always',
    line_items: [{ price: prices.data[0].id, quantity: 1 }],
    // Un seul client Stripe par compte ; e-mail prérempli sinon.
    ...(dbUser?.stripeCustomerId
      ? { customer: dbUser.stripeCustomerId, customer_update: { name: 'auto', address: 'auto' } }
      : dbUser?.email
        ? { customer_email: dbUser.email }
        : {}),
    locale: 'fr',
    allow_promotion_codes: true,
    // Factures conformes pour les entreprises : adresse et numéro de TVA.
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    subscription_data: {
      ...(trialEnd ? { trial_end: trialEnd } : {}),
      metadata: { userId, plan, billing },
    },
    success_url: `${appUrl}/dashboard`,
    cancel_url: `${appUrl}/dashboard/billing`,
    metadata: { userId, plan, billing },
  });

  return NextResponse.redirect(session.url!);
}
