import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log("Running Gemini generation test with custom preferences...");
  
  const { db } = await import('../lib/db');
  const { users } = await import('../lib/db/schema');
  const { eq } = await import('drizzle-orm');
  const { generateCaption } = await import('../lib/ai-generate');

  const userId = 'user_3E2HBXcRSqTpz5RdBAAJ0vWdA99';

  console.log("Setting user preferences in database...");
  await db.update(users).set({
    writingTone: 'inspiring',
    emojiPreference: 'lots',
    genderAgreement: 'female'
  }).where(eq(users.clerkId, userId));

  console.log("Generating caption with user preferences...");
  const result = await generateCaption({
    userId,
    userEmail: 'business-test@creatabl-ia.com',
    platform: 'instagram',
    idea: 'Lancer une nouvelle fonctionnalité IA pour créer du contenu automatiquement sur Creatabl'
  });

  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\nSUCCESS! Generated caption:\n');
    console.log(result.text);
  } else {
    console.error('\nFAILURE! Error:', result.message);
    process.exit(1);
  }
}

test().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
