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

    // Remove cancel_at_period_end in Stripe
    const subscription = await stripe.subscriptions.update(
      dbUser.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    // Update DB user
    await db
      .update(users)
      .set({
        subscriptionStatus: 'active',
        cancelAtPeriodEnd: false,
        cancelsAt: null,
      })
      .where(eq(users.clerkId, userId));

    // Sync to Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        cancelAtPeriodEnd: false,
        cancelsAt: null,
      },
    });

    console.log(`✅ Subscription reactivated for user ${userId}`);

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: false,
      cancelsAt: null,
    });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la réactivation' },
      { status: 500 }
    );
  }
}
