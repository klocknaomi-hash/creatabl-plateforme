import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { geminiModel } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prompt, platforms } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const platformContext = platforms?.length 
      ? `targeting ${platforms.join(", ")}` 
      : "for social media";

    const aiPrompt = `Write a compelling social media caption ${platformContext} based on this request: "${prompt}". 
    Include relevant hashtags. Keep it engaging and tailored to the audience of these platforms.
    Return ONLY the caption text.`;

    const result = await geminiModel.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ generated: text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
