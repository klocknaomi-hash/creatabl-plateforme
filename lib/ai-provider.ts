// lib/ai-provider.ts
// Fonction universelle generatePost — Creatabl
// Provider interchangeable : gemini | claude | openai
// Pour switcher : changer AI_PROVIDER dans .env.local

export type AIProvider = "gemini" | "claude" | "openai";

export type PostTone = "professional" | "storytelling" | "viral" | "educational" | "conversational";

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

export type GenerateAction = "improve" | "rewrite" | "change_tone" | "optimize_platform" | "generate" | "shorten" | "lengthen";

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

// Builds the system prompt according to the action
function buildSystemPrompt(action: GenerateAction, platform?: PostPlatform, tone?: PostTone): string {
  const platformGuide: Record<PostPlatform, string> = {
    linkedin: "LinkedIn: Professional and 'thought leadership' tone. Structure: Impactful hook, development with bullet points for readability, conclusion with an open question. Max 3 relevant hashtags. No excessive emojis.",
    instagram: "Instagram: Visual and narrative tone. Structure: Captivating first line (hook), generous use of emojis for structure, clear call to action. Frequent line breaks. 10-15 hashtags hidden at the bottom.",
    x: "X (Twitter): Ultra-concise (280 chars). 'Thread' or 'Punchy' style. Immediate hook, no fluff. 1-2 hashtags max. Direct and current language.",
    tiktok: "TikTok: Short and dynamic script. Structure: Hook (0-3s), Value/Story (3-15s), CTA (15-20s). Authentic tone, spoken language, fast pace.",
    facebook: "Facebook: Community and warm tone. Encourage debate or sharing experience. Medium to long text accepted. Friendly emojis.",
    youtube: "YouTube: Catchy title (Click-worthy but not clickbait). Description: Hook, keyword-rich summary, Chapters, Links, Subscription CTA.",
    pinterest: "Pinterest: Inspiring and 'How-to' oriented tone. Keyword-rich descriptive title. Description focused on user benefit and aesthetics.",
    discord: "Discord: Informal, community-driven, and direct tone. Use of Markdown syntax (bold, lists). Moderate pinging, reaction emojis.",
    slack: "Slack: Professional, concise, and actionable. Use of bullet points. Clear summary at the top if the message is long. Efficient tone.",
    twitter: "X (Twitter): Ultra-concise (280 chars). 'Punchy' style. Immediate hook, no fluff. 1-2 hashtags max. Direct and current language.",
  };

  const toneGuide: Record<PostTone, string> = {
    professional: "Expert, credible, and authoritative. Use facts, avoid empty superlatives. Structured sentences and precise vocabulary.",
    storytelling: "Narrative, emotional, and vulnerable. Start with a conflict or situation, develop the learning, end with a transformation.",
    viral: "Provocative, counter-intuitive, and ultra-shareable. Use powerful hooks, 'top X' lists, or strong but sourced opinions.",
    educational: "Pedagogical, structured (Why/How/Action). Use simple analogies. The goal is for the reader to learn something in 30 seconds.",
    conversational: "Relatable, friendly, and relaxed. Use 'you', ask questions, use natural language like during a coffee chat.",
  };

  const actionInstructions: Record<GenerateAction, string> = {
    improve: "Take this content and enhance it. Strengthen the hook, improve the sentence rhythm, and ensure the main message comes across with force. Do not change the intent.",
    rewrite: "Totally rewrite this post by exploring a new narrative angle while maintaining the original substance. Vary the vocabulary and syntactic structure.",
    change_tone: `Rewrite this post strictly adopting the following tone: ${tone ? toneGuide[tone] : "professional"}. Adjust vocabulary and punctuation accordingly.`,
    optimize_platform: `Rewrite and format this post specifically for ${platform ? platform.toUpperCase() : "LinkedIn"} respecting the cultural and technical codes of the platform: ${platform ? platformGuide[platform] : platformGuide.linkedin}.`,
    generate: "Create a complete, engaging post ready for publication from this topic. Include a hook, structured body text, and a call to action.",
    shorten: "Make this content more concise and punchy. Remove repetitions and useless words while keeping the essence of the message. Ideal for character limits.",
    lengthen: "Expand this content by adding relevant details, examples, or nuances. Make the text richer and more informative without useless filler.",
  };

  return `You are a world-class Social Media Management and Copywriting expert.
Your mission is to transform raw ideas into high-performing posts that generate engagement and conversion.

GOLDEN RULES:
- RESPONSE: Return ONLY the final post text.
- NO-NO: Never start with introductions (e.g., "Here is the post..."), never put quotes around the post, never end with conclusions.
- LANGUAGE: Perfect English (unless the source text is in another language, maintain consistency).
- FORMAT: Use line breaks to air out the text.

INSTRUCTION: ${actionInstructions[action]}
${platform ? `\nPLATFORM CONSTRAINTS: ${platformGuide[platform]}` : ""}
${tone && action !== "change_tone" ? `\nTONE NUANCE: ${toneGuide[tone]}` : ""}`;
}

// Gemini Flash
async function generateWithGemini(
  userContent: string,
  systemPrompt: string
): Promise<GeneratePostResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing in .env.local");

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
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing in .env.local");

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
  if (!apiKey) throw new Error("OPENAI_API_KEY missing in .env.local");

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

// Main function — single entry point
export async function generatePost(options: GeneratePostOptions): Promise<GeneratePostResult> {
  const {
    content,
    action,
    platform,
    tone,
  } = options;

  // Always use Gemini for social media post generation
  let provider: AIProvider = "gemini";

  if (!content?.trim()) throw new Error("Content cannot be empty");

  const systemPrompt = buildSystemPrompt(action, platform, tone);

  switch (provider as AIProvider) {
    case "gemini":
      return generateWithGemini(content, systemPrompt);
    case "claude":
      return generateWithClaude(content, systemPrompt);
    case "openai":
      return generateWithOpenAI(content, systemPrompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
