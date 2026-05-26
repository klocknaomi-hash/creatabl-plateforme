const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDetails() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  const sql = neon(dbUrl);
  
  const userId = 'de8fb069-50db-4c21-94c0-e3b19eb16481'; // Naomi's ID in database
  
  console.log("=== NAOMI USER RECORD ===");
  const user = await sql`SELECT * FROM users WHERE id = ${userId};`;
  console.log(JSON.stringify(user, null, 2));

  console.log("\n=== SOCIAL ACCOUNTS ===");
  const accounts = await sql`SELECT * FROM social_accounts WHERE user_id = ${userId};`;
  console.log(JSON.stringify(accounts, null, 2));
  
  console.log("\n=== POSTS ===");
  const posts = await sql`SELECT * FROM posts WHERE user_id = ${userId};`;
  console.log(JSON.stringify(posts, null, 2));
  
  console.log("\n=== POST PLATFORM RESULTS ===");
  const results = await sql`
    SELECT r.*, p.content 
    FROM post_platform_results r
    JOIN posts p ON r.post_id = p.id
    WHERE p.user_id = ${userId};
  `;
  console.log(JSON.stringify(results, null, 2));
}

checkDetails().catch(console.error);
