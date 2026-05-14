const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDb() {
  const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
  
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS writing_tone TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender_agreement TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS emoji_preference TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;`;
  console.log("Columns added successfully!");
}
checkDb().catch(console.error);
