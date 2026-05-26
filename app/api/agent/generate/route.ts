import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // 1. Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' }, 
        { status: 401 }
      )
    }

    // 2. Plan/trial status check (similar to other generation routes)
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId)
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé dans la base de données' },
        { status: 404 }
      )
    }

    const plan = (dbUser.plan || dbUser.selectedPlan || 'starter') as string
    const isPremium = plan === 'pro' || plan === 'business' || plan === 'agency'
    const trialEndsAt = dbUser.trialEndsAt
    const trialActive = trialEndsAt && new Date(trialEndsAt) > new Date()
    
    if (!isPremium && !trialActive && !dbUser.email.endsWith('@creatabl-ia.com')) {
      return NextResponse.json(
        { error: 'Upgrade required to access AI Agent feature' },
        { status: 403 }
      )
    }

    // 3. Read body parameters
    const body = await req.json()
    const { trend } = body

    if (!trend) {
      return NextResponse.json(
        { error: 'Le paramètre trend est requis' },
        { status: 400 }
      )
    }

    // 4. Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
        temperature: 0.75,
      }
    })

    const prompt = `
Tu es un expert en marketing sur les réseaux sociaux. Tu écris uniquement en français.
La tendance du moment est: "${trend}"

Génère 3 idées de posts différentes basées sur cette tendance. Pour chaque idée, donne:
- Un titre accrocheur (title)
- Un texte de post de 150 à 200 mots (content)
- 3-5 hashtags pertinents (hashtags)
- La plateforme recommandée (platform - doit être soit 'LinkedIn', 'Instagram', ou 'TikTok')
- Le meilleur moment pour publier (bestTime - ex. "Jeudi · 9h00")
- Un score d'engagement estimé de l'IA (score - entier entre 75 et 99)

Réponds uniquement en JSON valide avec ce format:
{
  "ideas": [
    {
      "title": "Titre de l'idée",
      "content": "Contenu complet rédigé avec accroche et mise en forme...",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "platform": "LinkedIn",
      "bestTime": "Mardi · 14h30",
      "score": 92
    }
  ]
}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON. Raw text was:', text, parseError)
      return NextResponse.json(
        { error: 'La réponse de l\'IA n\'a pas pu être analysée. Réessaie.' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('AI Agent generate route error:', error)
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la génération de contenu' },
      { status: 500 }
    )
  }
}
