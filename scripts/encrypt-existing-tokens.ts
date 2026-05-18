import { db } from '../lib/db'
import { users, socialAccounts } from '../lib/db/schema'
import { encrypt } from '../lib/crypto'
import { eq } from 'drizzle-orm'

async function migrate() {
  const allUsers = await db.select().from(users)
  for (const user of allUsers) {
    const updates: Record<string, string> = {}
    if (user.facebookAccessToken &&
        !user.facebookAccessToken.includes(':')) {
      updates.facebookAccessToken =
        encrypt(user.facebookAccessToken)
    }
    if ((user as any).instagramAccessToken &&
        !(user as any).instagramAccessToken.includes(':')) {
      updates.instagramAccessToken =
        encrypt((user as any).instagramAccessToken)
    }
    if (Object.keys(updates).length > 0) {
      await db.update(users)
        .set(updates)
        .where(eq(users.id, user.id))
      console.log('Migrated user:', user.clerkId)
    }
  }

  const allAccounts = await db.select().from(socialAccounts)
  for (const account of allAccounts) {
    const updates: Record<string, string> = {}
    if (account.accessToken && !account.accessToken.includes(':')) {
      updates.accessToken = encrypt(account.accessToken)
    }
    if (account.refreshToken && !account.refreshToken.includes(':')) {
      updates.refreshToken = encrypt(account.refreshToken)
    }
    if (Object.keys(updates).length > 0) {
      await db.update(socialAccounts)
        .set(updates)
        .where(eq(socialAccounts.id, account.id))
      console.log('Migrated social account:', account.platformUserId)
    }
  }

  console.log('Migration complete')
  process.exit(0)
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
