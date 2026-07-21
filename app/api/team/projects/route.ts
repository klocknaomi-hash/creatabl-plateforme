import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { posts, users as usersTable } from '@/lib/db/schema'
import { eq, or, desc } from 'drizzle-orm'

export async function GET() {
  const { userId: clerkId, orgId } = await auth()
  if (!clerkId) {
    return Response.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  })

  if (!userRecord) {
    return Response.json([])
  }

  const userPosts = await db.query.posts.findMany({
    where: orgId
      ? or(eq(posts.organizationId, orgId), eq(posts.userId, userRecord.id))
      : eq(posts.userId, userRecord.id),
    orderBy: [desc(posts.createdAt)],
  })

  return Response.json(userPosts)
}
