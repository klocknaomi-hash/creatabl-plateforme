const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDb() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No database URL found in .env.local");
    return;
  }
  
  const sql = neon(dbUrl);
  
  console.log("=== DB USERS ===");
  const dbUsers = await sql`SELECT id, clerk_id, email, name, plan, onboarding_completed FROM users LIMIT 20;`;
  console.log(JSON.stringify(dbUsers, null, 2));
  
  for (const user of dbUsers) {
    console.log(`\n=== DETAILS FOR USER: ${user.email} (${user.id}) ===`);
    const accounts = await sql`SELECT id, platform, username FROM social_accounts WHERE user_id = ${user.id};`;
    console.log(`Social accounts (${accounts.length}):`, JSON.stringify(accounts, null, 2));
    
    const postsCount = await sql`SELECT status, count(*) FROM posts WHERE user_id = ${user.id} GROUP BY status;`;
    console.log(`Posts status counts:`, JSON.stringify(postsCount, null, 2));
  }
}

checkDb().catch(console.error);
