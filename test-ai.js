require('dotenv').config({ path: '.env.local' });
const { generatePost } = require('./lib/ai-provider');

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
