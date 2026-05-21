import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { posts, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { publishPostImmediately } from '@/lib/platforms/publisher';
import { inngest } from '@/lib/inngest/client';
import { checkPlanLimit } from '@/lib/plan-limits';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRecord = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;

  try {
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, id), eq(posts.userId, userRecord.id)),
      with: {
        platformResults: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function incrementPostCount(clerkId: string) {
  await db.update(users)
    .set({ monthlyPostCount: sql`${users.monthlyPostCount} + 1` })
    .where(eq(users.clerkId, clerkId));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRecord = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { content, mediaUrls, platforms, scheduledAt, status } = body;

    const currentPost = await db.query.posts.findFirst({
      where: and(eq(posts.id, id), eq(posts.userId, userRecord.id)),
    });

    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (
      currentPost.status === 'draft' &&
      (status === 'published' || status === 'scheduled')
    ) {
      const limitCheck = await checkPlanLimit(clerkId!, 'posts');
      if (!limitCheck.allowed) {
        return Response.json(
          { error: limitCheck.message },
          { status: 403 }
        );
      }
      await incrementPostCount(clerkId!);
    }

    const [updatedPost] = await db.update(posts)
      .set({
        content,
        mediaUrls,
        platforms,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status,
      })
      .where(and(eq(posts.id, id), eq(posts.userId, userRecord.id)))
      .returning();

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Trigger publishing or schedule event based on status update
    if (status === 'published') {
      try {
        await publishPostImmediately(id, userRecord.id);
      } catch (pubError: any) {
        console.error('Immediate publish error in PATCH:', pubError);
      }
    } else if (status === 'scheduled' && scheduledAt) {
      try {
        await inngest.send({
          name: "post/scheduled",
          data: {
            postId: id,
            scheduledAt: new Date(scheduledAt).toISOString(),
          },
        });
      } catch (inngestError) {
        console.warn('Inngest event failed to send in PATCH:', inngestError);
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRecord = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { id } = await params;

  try {
    const [deletedPost] = await db.delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userRecord.id)))
      .returning();

    if (!deletedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Note: If using Inngest, we might want to cancel the run if possible.
    // For now, the Inngest function checks if the post exists before publishing.

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
