import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildIdeateurPrompt } from '@/lib/ai/prompts'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isNaomiOrTest } from '@/lib/plans'

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
    const isTest = isNaomiOrTest(dbUser.email) || dbUser.email.endsWith('@creatabl-ia.com')
    
    if (!isPremium && !trialActive && !isTest) {
      return NextResponse.json(
        { error: 'Upgrade required to access AI Agent feature' },
        { status: 403 }
      )
    }

    // 3. Read body parameters
    const body = await req.json()
    const { trend, source } = body

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
    const prompt = buildIdeateurPrompt(trend, source || 'Google Trends')

    let maxTokens = 1000
    let attempts = 0
    const maxAttempts = 2
    let text = ""
    let finishReason = ""

    while (attempts < maxAttempts) {
      attempts++
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
          temperature: 0.75,
        }
      })

      const result = await model.generateContent(prompt)
      text = result.response.text()
      const candidate = result.response.candidates?.[0]
      finishReason = candidate?.finishReason || ""

      // Check if truncated
      const isTruncated = finishReason === "MAX_TOKENS"
      
      // Also verify it is valid JSON
      let isValidJson = false
      try {
        const clean = text.replace(/```json|```/g, '').trim()
        JSON.parse(clean)
        isValidJson = true
      } catch (e) {}

      if ((isTruncated || !isValidJson) && attempts < maxAttempts) {
        console.warn(`[Gemini Agent] Generation truncated or invalid JSON (finishReason: ${finishReason}, isValidJson: ${isValidJson}). Retrying with 2048 tokens...`)
        maxTokens = 2048
        continue
      }
      break
    }

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
