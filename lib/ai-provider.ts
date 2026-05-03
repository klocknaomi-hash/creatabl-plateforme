// lib/ai-provider.ts
// Fonction universelle generatePost — Creatabl
// Provider interchangeable : gemini | claude | openai
// Pour switcher : changer AI_PROVIDER dans .env.local

export type AIProvider = "gemini" | "claude" | "openai";

export type PostTone = "professionnel" | "storytelling" | "viral" | "educatif" | "conversationnel";

export type PostPlatform = 
  | "linkedin" 
  | "instagram" 
  | "x" 
  | "tiktok" 
  | "facebook" 
  | "youtube" 
  | "pinterest" 
  | "discord" 
  | "slack" 
  | "twitter";

export type GenerateAction = "ameliorer" | "reformuler" | "changer_ton" | "optimiser_plateforme" | "generer" | "raccourcir" | "allonger";

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
    linkedin: "LinkedIn : Ton professionnel et 'thought leadership'. Structure : Accroche percutante, développement avec listes à puces pour la lisibilité, conclusion avec une question ouverte. Max 3 hashtags pertinents. Pas d'emojis excessifs.",
    instagram: "Instagram : Ton visuel et narratif. Structure : Première ligne captivante (hook), usage généreux d'emojis pour structurer, appel à l'action clair. Saut de lignes fréquents. 10-15 hashtags cachés en bas.",
    x: "X (Twitter) : Ultra-concis (280 car.). Style 'Thread' ou 'Punchy'. Hook immédiat, pas de fioritures. 1-2 hashtags max. Langage direct et actuel.",
    tiktok: "TikTok : Script court et dynamique. Structure : Hook (0-3s), Valeur/Story (3-15s), CTA (15-20s). Ton authentique, langage parlé, rythme rapide.",
    facebook: "Facebook : Ton communautaire et chaleureux. Encourage le débat ou le partage d'expérience. Texte moyen à long accepté. Emojis bienveillants.",
    youtube: "YouTube : Titre accrocheur (Click-worthy mais pas clickbait). Description : Hook, Résumé riche en mots-clés, Chapitres, Liens, CTA abonnement.",
    pinterest: "Pinterest : Ton inspirant et orienté 'How-to'. Titre descriptif riche en mots-clés. Description axée sur le bénéfice utilisateur et l'esthétique.",
    discord: "Discord : Ton informel, communautaire et direct. Utilisation de la syntaxe Markdown (gras, listes). Ping modéré, emojis de réaction.",
    slack: "Slack : Professionnel, concis et actionnable. Utilisation de listes à puces. Résumé clair en haut si le message est long. Ton efficace.",
    twitter: "X (Twitter) : Ultra-concis (280 car.). Style 'Punchy'. Hook immédiat, pas de fioritures. 1-2 hashtags max. Langage direct et actuel.",
  };

  const toneGuide: Record<PostTone, string> = {
    professionnel: "Expert, crédible et autoritaire. Utilise des faits, évite les superlatifs vides. Phrases structurées et vocabulaire précis.",
    storytelling: "Narratif, émotionnel et vulnérable. Commence par un conflit ou une situation, développe l'apprentissage, finit par une transformation.",
    viral: "Provocateur, contre-intuitif et ultra-partageable. Utilise des hooks puissants, des listes 'top X', ou des opinions tranchées mais sourcées.",
    educatif: "Pédagogique, structuré (Pourquoi/Comment/Action). Utilise des analogies simples. L'objectif est que le lecteur apprenne quelque chose en 30 secondes.",
    conversationnel: "Relatable, amical et détendu. Utilise le 'tu' ou le 'vous', pose des questions, utilise un langage naturel comme lors d'un café.",
  };

  const actionInstructions: Record<GenerateAction, string> = {
    ameliorer: "Prends ce contenu et sublime-le. Renforce l'accroche, améliore le rythme des phrases, et assure-toi que le message principal ressorte avec force. Ne change pas l'intention.",
    reformuler: "Réécris totalement ce post en explorant un nouvel angle narratif tout en conservant la substance originale. Varie le vocabulaire et la structure syntaxique.",
    changer_ton: `Réécris ce post en adoptant strictement le ton suivant : ${tone ? toneGuide[tone] : "professionnel"}. Ajuste le vocabulaire et la ponctuation en conséquence.`,
    optimiser_plateforme: `Réécris et formate ce post spécifiquement pour ${platform ? platform.toUpperCase() : "LinkedIn"} en respectant les codes culturels et techniques de la plateforme : ${platform ? platformGuide[platform] : platformGuide.linkedin}.`,
    generer: "Crée un post complet, engageant et prêt à être publié à partir de ce sujet. Inclus une accroche, un corps de texte structuré et un appel à l'action.",
    raccourcir: "Rends ce contenu plus concis et percutant. Supprime les répétitions et les mots inutiles tout en gardant l'essence du message. Idéal pour les limites de caractères.",
    allonger: "Développe ce contenu en ajoutant des détails pertinents, des exemples ou des nuances. Rends le texte plus riche et informatif sans faire de remplissage inutile.",
  };

  return `Tu es un expert en Social Media Management et Copywriting de classe mondiale.
Ta mission est de transformer des idées brutes en posts hautement performants qui génèrent de l'engagement et de la conversion.

RÈGLES D'OR :
- RÉPONSE : Retourne UNIQUEMENT le texte du post final.
- NO-NO : Jamais d'introduction (ex: "Voici le post..."), jamais de guillemets autour du post, jamais de conclusion.
- LANGUE : Français impeccable (sauf si le texte source est dans une autre langue, garde la cohérence).
- FORMAT : Utilise le saut de ligne pour aérer le texte.

INSTRUCTION : ${actionInstructions[action]}
${platform ? `\nCONTRAINTES PLATEFORME : ${platformGuide[platform]}` : ""}
${tone && action !== "changer_ton" ? `\nNUANCE DE TON : ${toneGuide[tone]}` : ""}`;
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
