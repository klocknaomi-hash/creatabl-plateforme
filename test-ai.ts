import { config } from 'dotenv';
config({ path: '.env.local' });
import { generatePost } from './lib/ai-provider';

async function test() {
  try {
    const res = await generatePost({
      content: "Ceci est un petit test",
      action: "ameliorer",
      provider: "gemini"
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
