import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const plan = req.nextUrl.searchParams.get('plan') || 'starter';
  const billing = req.nextUrl.searchParams.get('billing') || 'monthly';

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
    line_items: [{ price: prices.data[0].id, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId, plan, billing },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tarifs`,
    metadata: { userId, plan, billing },
  });

  return NextResponse.redirect(session.url!);
}
