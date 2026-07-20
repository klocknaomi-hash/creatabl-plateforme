import { db } from '@/lib/db';
import { socialAccounts } from '@/lib/db/schema';
import { lt, isNotNull, and, eq } from 'drizzle-orm';
import { decryptToken, encryptToken } from '@/lib/encryption';
import { getPlatformClient } from '@/lib/platforms';

export async function processTokenRefresh() {
  const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Find accounts with tokens expiring in the next 24 hours that have a refresh token
  const accountsToRefresh = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        lt(socialAccounts.expiresAt, twentyFourHoursFromNow),
        isNotNull(socialAccounts.refreshToken)
      )
    );

  for (const account of accountsToRefresh) {
    try {
      const client = getPlatformClient(account.platform);
      const decryptedRefreshToken = decryptToken(account.refreshToken!);
      
      const newTokens = await client.refreshToken(decryptedRefreshToken);
      
      await db.update(socialAccounts).set({
        accessToken: encryptToken(newTokens.accessToken),
        refreshToken: newTokens.refreshToken ? encryptToken(newTokens.refreshToken) : account.refreshToken,
        expiresAt: newTokens.expiresAt,
      }).where(eq(socialAccounts.id, account.id));
    } catch (error) {
      console.error(`Failed to refresh token for account ${account.id} (${account.platform}):`, error);
    }
  }
}

