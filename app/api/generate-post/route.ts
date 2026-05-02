import { NextRequest, NextResponse } from "next/server";
import { generatePost, GeneratePostOptions } from "@/lib/ai-provider";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { aiLogs } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body: GeneratePostOptions = await req.json();

    if (!body.content || !body.action) {
      return NextResponse.json(
        { error: "content et action sont requis" },
        { status: 400 }
      );
    }

    const result = await generatePost(body);

    await db.insert(aiLogs).values({
      userId,
      action: body.action,
      platform: body.platform ?? null,
      tone: body.tone ?? null,
      provider: result.provider,
      tokensUsed: result.tokensUsed ?? null,
    });

    return NextResponse.json({ result: result.result, provider: result.provider });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[generate-post] Erreur:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
