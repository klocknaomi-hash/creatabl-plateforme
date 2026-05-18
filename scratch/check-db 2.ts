
import { db } from './lib/db';
import { socialAccounts, users } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkAccounts() {
  const allUsers = await db.select().from(users);
  console.log('Users found:', allUsers.length);
  
  for (const user of allUsers) {
    console.log(`\nUser: ${user.email} (${user.id})`);
    console.log(`- FB Token: ${user.facebookAccessToken ? 'Yes' : 'No'}`);
    console.log(`- FB Page ID: ${user.facebookPageId}`);
    console.log(`- IG Account ID: ${user.instagramAccountId}`);
    
    const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.userId, user.id));
    console.log(`- Social Accounts in DB: ${accounts.length}`);
    accounts.forEach(acc => {
      console.log(`  * ${acc.platform}: ${acc.username}`);
    });
  }
}

checkAccounts().catch(console.error);
