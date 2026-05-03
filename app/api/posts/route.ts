import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { posts, postPlatformResults, mediaAssets } from '@/lib/db/schema';
import { inngest } from '@/lib/inngest/client';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { users as usersTable } from '@/lib/db/schema';
import { checkPlanLimit } from '@/lib/plan-limits';

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });

  if (!userRecord) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check limits (if not a draft)
  const body = await request.clone().json();
  if (body.status !== 'draft') {
    const { allowed, current, limit } = await checkPlanLimit(clerkId, 'postsPerMonth');
    if (!allowed) {
      return NextResponse.json({ 
        error: `Monthly post limit reached. You have used ${current} of ${limit} posts. Upgrade to Pro for more.`,
        limitReached: true
      }, { status: 403 });
    }
  }

  try {
    const body = await request.json();
    const { content, mediaUrls, platforms, scheduledAt, mediaFiles, status: requestedStatus } = body;

    // Validate required fields (only if not a draft)
    if (requestedStatus !== 'draft') {
      if (!content || !platforms || !platforms.length) {
        return NextResponse.json({ error: 'Content and at least one platform are required for publishing/scheduling' }, { status: 400 });
      }
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date();
    const isImmediate = !scheduledAt || scheduledDate <= new Date();
    
    // Determine final status
    const finalStatus = requestedStatus === 'draft' 
      ? 'draft' 
      : (isImmediate ? 'published' : 'scheduled');

    // 1. Create Post
    const [newPost] = await db.insert(posts).values({
      userId: userRecord.id,
      content,
      mediaUrls,
      platforms,
      status: finalStatus,
      scheduledAt: finalStatus === 'draft' ? null : scheduledDate,
    }).returning();

    // 2. Initialize Platform Results (only if not a draft)
    if (finalStatus !== 'draft') {
      for (const platform of platforms) {
        await db.insert(postPlatformResults).values({
          postId: newPost.id,
          platform,
          status: 'pending',
        });
      }
    }

    // 3. Store Media Assets (if provided)
    if (mediaFiles && Array.isArray(mediaFiles)) {
      for (const file of mediaFiles) {
        // Check if asset already exists to avoid duplication
        const existing = await db.query.mediaAssets.findFirst({
          where: eq(mediaAssets.fileId, file.fileId)
        });
        
        if (!existing) {
          await db.insert(mediaAssets).values({
            userId: userRecord.id,
            url: file.url,
            fileId: file.fileId,
            name: file.name,
            mimeType: file.mimeType || 'image/jpeg',
            size: file.size || '0',
          });
        }
      }
    }

    // 4. Trigger Inngest Event (only if not a draft)
    if (finalStatus !== 'draft') {
      try {
        await inngest.send({
          name: "post/scheduled",
          data: {
            postId: newPost.id,
            scheduledAt: isImmediate ? null : scheduledDate.toISOString(),
          },
        });
      } catch (inngestError) {
        console.warn('Inngest event failed to send (likely missing INNGEST_EVENT_KEY):', inngestError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      postId: newPost.id,
      status: finalStatus
    });
  } catch (error: any) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRecord = await db.query.users.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });
  if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const filters = [eq(posts.userId, userRecord.id)];
    if (status) filters.push(eq(posts.status, status as any));
    if (startDate) filters.push(gte(posts.scheduledAt, new Date(startDate)));
    if (endDate) filters.push(lte(posts.scheduledAt, new Date(endDate)));
    
    const allPosts = await db.query.posts.findMany({
      where: and(...filters),
      orderBy: desc(posts.scheduledAt || posts.createdAt),
      limit,
      offset,
      with: {
        platformResults: true
      }
    });

    let filteredPosts = allPosts;
    if (platform) {
      filteredPosts = allPosts.filter(p => (p.platforms as string[]).includes(platform));
    }

    return NextResponse.json({ posts: filteredPosts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
