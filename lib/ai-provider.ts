// lib/ai-provider.ts
// Fonction universelle generatePost — Creatabl
// Provider interchangeable : gemini | claude | openai
// Pour switcher : changer AI_PROVIDER dans .env.local

export type AIProvider = "gemini" | "claude" | "openai";

export type PostTone = "professionnel" | "storytelling" | "viral" | "educatif" | "conversationnel";

export type PostPlatform = "linkedin" | "instagram" | "x" | "tiktok";

export type GenerateAction = "ameliorer" | "reformuler" | "changer_ton" | "optimiser_plateforme" | "generer";

export interface GeneratePostOptions {
  content: string;
  action: GenerateAction;
  platform?: PostPlatform;
  tone?: PostTone;
  provider?: AIProvider;
}

export interface GeneratePostResult {
  result: string;
  provider: AIProvider;
  tokensUsed?: number;
}

// Construit le prompt système selon l'action
function buildSystemPrompt(action: GenerateAction, platform?: PostPlatform, tone?: PostTone): string {
  const platformGuide: Record<PostPlatform, string> = {
    linkedin: "LinkedIn : ton professionnel, phrases courtes, 1 idée forte par paragraphe, 3 à 5 paragraphes max, pas de hashtags excessifs (2-3 max)",
    instagram: "Instagram : accroche forte en 1re ligne, emojis pertinents, hashtags en fin (10-15), ton authentique et personnel",
    x: "X/Twitter : 280 caractères max par tweet, percutant, une seule idée, hook dès le 1er mot",
    tiktok: "TikTok : script vidéo court, hook choc en 3 secondes, storytelling rapide, call-to-action clair",
  };

  const toneGuide: Record<PostTone, string> = {
    professionnel: "Ton expert, autorité naturelle, données et insights concrets, pas de jargon inutile.",
    storytelling: "Ton narratif, anecdote personnelle ou scénario, émotion, chute ou leçon en fin de post.",
    viral: "Ton provocateur mais honnête, chiffre ou stat surprenante, contre-intuition, très partageable.",
    educatif: "Ton pédagogique, structure claire (problème → explication → solution), exemples concrets.",
    conversationnel: "Ton proche, naturel, comme si tu parlais à un ami, phrases courtes, questions rhétoriques.",
  };

  const actionInstructions: Record<GenerateAction, string> = {
    ameliorer: "Améliore ce post en le rendant plus engageant, plus clair et plus percutant. Garde le sens et le ton original.",
    reformuler: "Reformule entièrement ce post en gardant le même message mais avec une approche et des mots différents.",
    changer_ton: `Réécris ce post avec le ton suivant : ${tone ? toneGuide[tone] : "professionnel"}`,
    optimiser_plateforme: `Optimise et adapte ce post pour ${platform ? platformGuide[platform] : "LinkedIn"}.`,
    generer: "Génère un post complet et engageant à partir de cette idée ou de ce sujet.",
  };

  return `Tu es un expert en création de contenu pour les réseaux sociaux, spécialisé dans la rédaction de posts performants en français.

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec le post final, sans introduction ni explication
- Ne dis jamais "Voici", "Bien sûr", "Je vais" ou toute phrase d'introduction
- Ne mets pas le post entre guillemets
- Pas de commentaires après le post
- Écris uniquement en français

INSTRUCTION : ${actionInstructions[action]}
${platform ? `\nFORMAT CIBLE : ${platformGuide[platform]}` : ""}
${tone && action !== "changer_ton" ? `\nTON SOUHAITÉ : ${toneGuide[tone]}` : ""}`;
}

// Gemini Flash
async function generateWithGemini(
  userContent: string,
  systemPrompt: string
): Promise<GeneratePostResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquante dans .env.local");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userContent }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const tokensUsed = data.usageMetadata?.totalTokenCount;

  return { result: result.trim(), provider: "gemini", tokensUsed };
}

// Claude (Anthropic)
async function generateWithClaude(
  userContent: string,
  systemPrompt: string
): Promise<GeneratePostResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquante dans .env.local");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Claude error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const result = data.content?.[0]?.text ?? "";
  const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens;

  return { result: result.trim(), provider: "claude", tokensUsed };
}

// OpenAI GPT-4o-mini
async function generateWithOpenAI(
  userContent: string,
  systemPrompt: string
): Promise<GeneratePostResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY manquante dans .env.local");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenAI error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content ?? "";
  const tokensUsed = data.usage?.total_tokens;

  return { result: result.trim(), provider: "openai", tokensUsed };
}

// Fonction principale — point d'entrée unique
export async function generatePost(options: GeneratePostOptions): Promise<GeneratePostResult> {
  const {
    content,
    action,
    platform,
    tone,
    provider = (process.env.AI_PROVIDER as AIProvider) ?? "gemini",
  } = options;

  if (!content?.trim()) throw new Error("Le contenu ne peut pas être vide");

  const systemPrompt = buildSystemPrompt(action, platform, tone);

  switch (provider) {
    case "gemini":
      return generateWithGemini(content, systemPrompt);
    case "claude":
      return generateWithClaude(content, systemPrompt);
    case "openai":
      return generateWithOpenAI(content, systemPrompt);
    default:
      throw new Error(`Provider inconnu : ${provider}`);
  }
}
