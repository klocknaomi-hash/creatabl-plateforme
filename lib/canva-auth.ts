import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { decrypt, encrypt } from '@/lib/crypto'

export async function getValidCanvaToken(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })

  if (!user || !user.canvaAccessToken) {
    return null
  }

  // Check if token is expired (or close to expiring, < 5 minutes)
  const isExpired = user.canvaTokenExpiresAt && new Date(user.canvaTokenExpiresAt.getTime() - 5 * 60000) < new Date()

  if (isExpired && user.canvaRefreshToken) {
    try {
      const decryptedRefreshToken = decrypt(user.canvaRefreshToken)
      
      const tokenResponse = await fetch('https://api.canva.com/rest/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: decryptedRefreshToken,
          client_id: process.env.CANVA_CLIENT_ID!,
          client_secret: process.env.CANVA_CLIENT_SECRET!,
        }),
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenData.access_token) {
        throw new Error('Failed to refresh token')
      }

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

      await db.update(users)
        .set({
          canvaAccessToken: encrypt(tokenData.access_token),
          canvaRefreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : user.canvaRefreshToken,
          canvaTokenExpiresAt: expiresAt,
        })
        .where(eq(users.clerkId, userId))

      return tokenData.access_token
    } catch (error) {
      console.error('Failed to refresh Canva token:', error)
      return null
    }
  }

  return decrypt(user.canvaAccessToken)
}
