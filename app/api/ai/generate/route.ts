import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateCaption } from '@/lib/ai-generate'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { checkPlanLimit } from '@/lib/plans/check-limit'
import { checkActiveAccess } from '@/lib/plans/check-active'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' }, 
        { status: 401 }
      )
    }

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress || ''

    // Check active trial or subscription
    const activeCheck = await checkActiveAccess(userId);
    if (!activeCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'TRIAL_EXPIRED',
        message: 'Ton essai est terminé. Choisis un forfait pour continuer.'
      }, { status: 403 })
    }

    // Check monthly plan limit
    const limitCheck = await checkPlanLimit(userId, 'aiGenerations');
    if (!limitCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'limit_reached',
        limit: 'aiGenerations',
        upgradeUrl: '/pricing',
        message: `Limite mensuelle de générations IA atteinte (${limitCheck.current}/${limitCheck.limit}). Passe au plan supérieur pour continuer.`
      }, { status: 402 })
    }

    const body = await req.json()
    const { platform, idea } = body

    if (!platform || !idea) {
      return NextResponse.json(
        { error: 'Platform et idea sont requis' },
        { status: 400 }
      )
    }

    if (idea.trim().length < 3) {
      return NextResponse.json(
        { error: 'Décris ton idée en quelques mots minimum' },
        { status: 400 }
      )
    }

    const result = await generateCaption({
      userId,
      userEmail,
      platform,
      idea: idea.trim()
    })

    if (!result.success) {
      const status = result.error === 'RATE_LIMIT' ? 429 : 500
      return NextResponse.json(result, { status })
    }

    // Increment AI count
    await db.update(users)
      .set({ monthlyAiCount: sql`${users.monthlyAiCount} + 1` })
      .where(eq(users.clerkId, userId));

    return NextResponse.json(result)

  } catch (error) {
    console.error('AI generate route error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
