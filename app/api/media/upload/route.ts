import { NextRequest, NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { mediaAssets, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

import { checkPlanLimit } from '@/lib/plan-limits';
import { checkActiveAccess } from '@/lib/plans/check-active';

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check active trial or subscription
  const activeCheck = await checkActiveAccess(clerkId);
  if (!activeCheck.allowed) {
    return NextResponse.json({
      error: "trial_expired",
      message: "Ton essai gratuit est terminé. Choisis un forfait pour continuer."
    }, { status: 403 });
  }

  // Storage check
  const storageStatus = await checkPlanLimit(clerkId, 'storageLimit');
  if (!storageStatus.allowed) {
    return NextResponse.json({ 
      error: "You’ve reached your media storage limit for your current plan." 
    }, { status: 403 });
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!userRecord) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `/users/${clerkId}/posts`,
    });

    const [asset] = await db.insert(mediaAssets).values({
      userId: userRecord.id,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      mimeType: file.type,
      size: file.size.toString(),
    }).returning();

    return NextResponse.json(asset);
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
