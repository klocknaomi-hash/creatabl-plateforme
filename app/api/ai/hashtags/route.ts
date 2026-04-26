import { NextRequest, NextResponse } from 'next/server';
import { generateHashtags } from '@/lib/gemini';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { caption } = await request.json();
    if (!caption) {
      return NextResponse.json({ error: 'Caption is required' }, { status: 400 });
    }

    const hashtags = await generateHashtags(caption);
    return NextResponse.json({ hashtags });
  } catch (error: any) {
    console.error('AI Hashtag error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
