import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { isNaomiOrTest } from './plans'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PLATFORM_LIMITS = {
  instagram: 2200,
  linkedin: 3000,
  twitter: 280,
  facebook: 63206,
  tiktok: 2200,
}

const PLATFORM_TIPS = {
  instagram: "Utilise des emojis visuels, des hashtags à la fin, ton accrocheur.",
  linkedin: "Ton professionnel, commence par une accroche forte, pas trop de hashtags (max 3).",
  twitter: "Ultra court, percutant, 1-2 hashtags max, va droit au but.",
  facebook: "Conversationnel, engage la communauté, pose une question si possible.",
  tiktok: "Jeune, dynamique, tendance, emojis, hashtags populaires.",
}

export async function generateCaption({
  userId,
  userEmail,
  platform,
  idea,
}: {
  userId: string
  userEmail: string
  platform: keyof typeof PLATFORM_LIMITS
  idea: string
}) {

  // 1. Check rate limit (skip for test accounts)
  const isTest = isNaomiOrTest(userEmail) || userEmail.endsWith('@creatabl-ia.com');
  if (!isTest) {
    const { checkAndIncrementUsage } = await import('./ai-rate-limit')
    const allowed = await checkAndIncrementUsage(userId)
    if (!allowed) {
      return {
        success: false,
        error: 'RATE_LIMIT',
        message: "Tu as atteint ta limite de générations IA pour aujourd'hui. Reviens demain ou passe à un plan supérieur."
      }
    }
  }

  // 2. Get user preferences from DB
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId)
  })

  const writingTone = user?.writingTone || 'professional'
  const genderAgreement = user?.genderAgreement || 'none'
  const emojiPreference = user?.emojiPreference || 'moderate'

  // 3. Build tone instruction
  const toneMap = {
    professional: "Professionnel : sérieux, structuré, crédible.",
    inspiring: "Inspirant : motivant, positif, humain.",
    direct: "Direct : court, percutant, sans détour.",
    casual: "Décontracté : naturel, accessible, sympathique.",
  }

  const genderMap = {
    female: "Utilise l'accord féminin dans le texte.",
    male: "Utilise l'accord masculin dans le texte.",
    none: "Genre neutre, pas d'accord particulier.",
  }

  const emojiMap = {
    none: "N'utilise AUCUN emoji.",
    moderate: "Utilise 1 à 4 emojis pertinents.",
    lots: "Utilise plusieurs emojis expressifs (4+).",
  }

  // 4. Build the full prompt
  const systemPrompt = `Tu es un expert en marketing digital et création de contenu pour les réseaux sociaux. Tu écris uniquement en français.

RÉSEAU CIBLE : ${platform.toUpperCase()}
LIMITE DE CARACTÈRES : ${PLATFORM_LIMITS[platform]} caractères maximum
CONSEIL PLATEFORME : ${PLATFORM_TIPS[platform]}

STYLE D'ÉCRITURE :
- Ton : ${toneMap[writingTone as keyof typeof toneMap] || toneMap.professional}
- Genre : ${genderMap[genderAgreement as keyof typeof genderMap] || genderMap.none}
- Emojis : ${emojiMap[emojiPreference as keyof typeof emojiMap] || emojiMap.moderate}

RÈGLES STRICTES :
- Écris UNIQUEMENT la légende finale, rien d'autre
- Pas de guillemets autour du texte
- Pas d'explication, pas de commentaire
- Respecte la limite de caractères
- Inclus 2-4 hashtags pertinents à la fin (sauf LinkedIn max 3)
- Commence par une accroche forte qui donne envie de lire la suite`

  const userPrompt = `Idée / sujet du post : ${idea}

Génère une légende optimisée pour ${platform}.`

  // 5. Call Gemini
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.8,
      }
    })

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ])

    const generated = result.response.text()

    if (!generated || generated.trim().length === 0) {
      return {
        success: false,
        error: 'EMPTY_RESPONSE',
        message: "La génération IA n'a pas retourné de résultat. Réessaie."
      }
    }

    return {
      success: true,
      text: generated.trim(),
      platform,
      charactersUsed: generated.trim().length,
      charactersMax: PLATFORM_LIMITS[platform]
    }

  } catch (error: any) {
    console.error('Gemini generation error:', error)
    
    if (error?.status === 429) {
      return {
        success: false,
        error: 'API_RATE_LIMIT',
        message: "Trop de requêtes IA en ce moment. Réessaie dans quelques secondes."
      }
    }

    return {
      success: false,
      error: 'GENERATION_FAILED',
      message: "Erreur lors de la génération. Réessaie."
    }
  }
}
