import { NextRequest, NextResponse } from 'next/server';
import { rewriteCaption } from '@/lib/gemini';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { caption, tone } = await request.json();
    if (!caption) {
      return NextResponse.json({ error: 'Caption is required' }, { status: 400 });
    }

    const rewritten = await rewriteCaption(caption, tone || 'professional');
    return NextResponse.json({ rewritten });
  } catch (error: any) {
    console.error('AI Rewrite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
