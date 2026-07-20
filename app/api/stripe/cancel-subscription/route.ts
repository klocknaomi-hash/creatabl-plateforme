import Stripe from 'stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser || !dbUser.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement Stripe actif trouvé' },
        { status: 400 }
      );
    }

    // Set cancel_at_period_end in Stripe
    const subscription = await stripe.subscriptions.update(
      dbUser.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    const cancelsAt = new Date(subscription.current_period_end * 1000);

    // Update DB user
    await db
      .update(users)
      .set({
        subscriptionStatus: 'canceling',
        cancelAtPeriodEnd: true,
        cancelsAt: cancelsAt,
      })
      .where(eq(users.clerkId, userId));

    // Sync to Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        cancelAtPeriodEnd: true,
        cancelsAt: cancelsAt.toISOString(),
      },
    });

    console.log(`✅ Subscription set to cancel at period end for user ${userId} (${cancelsAt.toISOString()})`);

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      cancelsAt: cancelsAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la résiliation' },
      { status: 500 }
    );
  }
}
