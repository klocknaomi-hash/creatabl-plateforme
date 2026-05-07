import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle checkout completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || 'starter';
    const billing = session.metadata?.billing || 'monthly';
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Fetch subscription to get trial end date
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId
    );

    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    await db.update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: subscription.items.data[0].price.id,
        plan,
        billingCycle: billing,
        trialEndsAt,
        subscriptionStatus: subscription.status,
      })
      .where(eq(users.clerkId, userId!));

    console.log(`✅ User ${userId} → plan ${plan} · trial ends ${trialEndsAt}`);
  }

  // Handle subscription updated (upgrade/downgrade)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;

    if (userId) {
      await db.update(users)
        .set({
          plan: subscription.metadata?.plan || 'starter',
          subscriptionStatus: subscription.status,
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        })
        .where(eq(users.clerkId, userId));
    }
  }

  // Handle payment failed
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    await db.update(users)
      .set({ subscriptionStatus: 'past_due' })
      .where(eq(users.stripeCustomerId, customerId));

    console.log(`⚠️ Payment failed for customer ${customerId}`);
  }

  // Handle trial ending soon (3 days before)
  if (event.type === 'customer.subscription.trial_will_end') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    console.log(`⏰ Trial ending soon for user ${userId}`);
    // TODO: send reminder email here
  }

  return NextResponse.json({ received: true });
}

// Required: disable body parsing for Stripe webhook
export const config = {
  api: { bodyParser: false },
};
