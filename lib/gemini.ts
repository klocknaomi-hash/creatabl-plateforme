import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const generateHashtags = async (caption: string): Promise<string[]> => {
  const prompt = `Generate 5-10 relevant hashtags for the following social media caption. Return ONLY a comma-separated list of hashtags without the # symbol.\n\nCaption: ${caption}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.split(',').map(tag => tag.trim());
};

export const rewriteCaption = async (caption: string, tone: string): Promise<string> => {
  const prompt = `Rewrite the following social media caption in a ${tone} tone.\n\nCaption: ${caption}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

export const generateCommentReply = async (comment: string, tone: string): Promise<string> => {
  const prompt = `Generate a reply to the following social media comment in a ${tone} tone.\n\nComment: ${comment}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
