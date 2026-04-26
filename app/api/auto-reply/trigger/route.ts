import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Manually trigger the comment monitor function via Inngest
    // Note: This triggers the background job
    await inngest.send({
      name: "comment/monitor.trigger",
      data: { manual: true }
    });

    return NextResponse.json({ success: true, message: "Comment monitor triggered" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
