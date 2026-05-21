import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

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

    // Sync to Clerk metadata
    await (await clerkClient()).users.updateUserMetadata(userId!, {
      publicMetadata: {
        plan: plan,
        billing: billing,
      },
    });

    console.log(`✅ User ${userId} → plan ${plan} · trial ends ${trialEndsAt}`);
  }

  // Handle subscription updated or created
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;
    const customerId = subscription.customer as string;

    let targetClerkId: string | undefined = userId;
    if (!targetClerkId) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId)
      });
      targetClerkId = dbUser?.clerkId;
    }

    const plan = subscription.metadata?.plan || 'starter';
    const billing = subscription.metadata?.billing || 'monthly';

    let userQuery = eq(users.stripeCustomerId, customerId);
    if (targetClerkId) {
      userQuery = eq(users.clerkId, targetClerkId);
    }

    if (subscription.status === 'active') {
      await db.update(users)
        .set({
          plan: plan,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          trialEndsAt: null, // clear trial
          subscriptionStatus: 'active',
          isSubscribed: true,
        })
        .where(userQuery);

      if (targetClerkId) {
        await (await clerkClient()).users.updateUserMetadata(targetClerkId, {
          publicMetadata: {
            onboardingStep: 'done',
            plan: plan,
            trialEndsAt: null,
            subscriptionActive: true,
            billing: billing
          }
        });
      }
      console.log(`✅ Subscription activated for customer ${customerId}, plan ${plan}`);
    } else {
      const updateData: any = {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      };

      if (subscription.trial_end) {
        updateData.trialEndsAt = new Date(subscription.trial_end * 1000);
      }

      await db.update(users)
        .set(updateData)
        .where(userQuery);

      if (targetClerkId) {
        await (await clerkClient()).users.updateUserMetadata(targetClerkId, {
          publicMetadata: {
            plan: plan,
            billing: billing,
          },
        });
      }
      console.log(`ℹ️ Subscription status updated to ${subscription.status} for customer ${customerId}`);
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

