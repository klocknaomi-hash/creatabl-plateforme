import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

// Portail client Stripe : moyen de paiement, factures, adresse de facturation.
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: 'no_customer', message: "Aucun paiement enregistré pour l'instant." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.creatabl-ia.com';
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
      locale: 'fr',
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe] portal:', err);
    return NextResponse.json(
      { error: 'portal_unavailable', message: "L'espace de facturation n'est pas encore disponible. Réessayez plus tard." },
      { status: 502 }
    );
  }
}
