import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, posts, postPlatformResults, socialAccounts, mediaAssets, autoReplyRules } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function POST(req: Request) {
  console.log('Webhook received');
  try {
    const WEBHOOK_SECRET = process.env.SVIX_SECRET

    if (!WEBHOOK_SECRET) {
      console.error('SVIX_SECRET is missing');
      return new Response('Error: SVIX_SECRET is missing', { status: 500 });
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    console.log('Headers:', { svix_id, svix_timestamp, svix_signature });

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new Response('Error occured -- no svix headers', {
        status: 400
      })
    }

    // Get the body
    const body = await req.text()
    console.log('Body length:', body.length);
    const payload = JSON.parse(body)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent
      console.log('Webhook verified successfully');
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured during verification', {
        status: 400
      })
    }

    // Handle the event
    const eventType = evt.type;
    console.log('Event type:', eventType);

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      console.log('User data from Clerk:', { id, email_addresses, first_name, last_name });
      
      if (!id) {
        throw new Error('No user ID found in event data');
      }

      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(' ') || null;

      if (email) {
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        console.log('Inserting/Updating user in DB:', { id, email, name });
        await db.insert(users).values({
          clerkId: id,
          email,
          name,
          plan: 'business',
          selectedPlan: 'starter',
          subscriptionStatus: 'trialing',
          trialStartedAt: new Date(),
          trialEndsAt: trialEndsAt,
        }).onConflictDoUpdate({
          target: users.clerkId,
          set: {
            email,
            name,
          }
        });
        console.log('DB operation successful');
      } else {
        console.warn('No email found for user', id);
      }
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(' ') || null;
      const plan = (public_metadata?.plan as any) || 'free';

      if (id && email) {
        console.log('Updating user in DB:', { id, email, name, plan });
        await db.update(users).set({
          email,
          name,
          plan,
        }).where(eq(users.clerkId, id));
        console.log('DB update successful');
      }
    }

    if (eventType === 'organization.deleted') {
      const { id: orgId } = evt.data;
      console.log('Organization deleted event received for orgId:', orgId);

      if (orgId) {
        // 1. Delete auto reply rules for this organization
        await db.delete(autoReplyRules).where(eq(autoReplyRules.organizationId, orgId));

        // 2. Find posts associated with this organization and delete their platform results first
        const orgPosts = await db.query.posts.findMany({
          where: eq(posts.organizationId, orgId),
          columns: { id: true },
        });

        if (orgPosts.length > 0) {
          const postIds = orgPosts.map((p) => p.id);
          await db.delete(postPlatformResults).where(inArray(postPlatformResults.postId, postIds));
          await db.delete(posts).where(eq(posts.organizationId, orgId));
        }

        // 3. Delete social accounts for this organization
        await db.delete(socialAccounts).where(eq(socialAccounts.organizationId, orgId));

        // 4. Delete media assets for this organization
        await db.delete(mediaAssets).where(eq(mediaAssets.organizationId, orgId));

        console.log(`Cascade deletion completed for organization: ${orgId}`);
      }
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error: any) {
    console.error('CRITICAL Webhook processing error:', error);
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 })
  }
}
