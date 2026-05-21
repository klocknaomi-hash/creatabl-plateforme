import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { workspaces, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAccess } from '@/lib/get-access'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resolve Clerk userId to DB UUID
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const userWorkspaces = await db.query.workspaces.findMany({
    where: eq(workspaces.ownerId, user.id),
  })

  return Response.json(userWorkspaces)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const access = await getAccess()
  if (!access.multiAccounts) {
    return Response.json(
      { error: 'Multi-comptes nécessite le plan Business.' },
      { status: 403 }
    )
  }

  // Resolve Clerk userId to DB UUID
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const existing = await db.query.workspaces.findMany({
    where: eq(workspaces.ownerId, user.id),
  })

  if (existing.length >= 5) {
    return Response.json(
      { error: 'Maximum 5 workspaces atteint.' },
      { status: 403 }
    )
  }

  const { name } = await req.json()
  if (!name || !name.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 })
  }

  const workspace = await db
    .insert(workspaces)
    .values({ name: name.trim(), ownerId: user.id })
    .returning()

  return Response.json(workspace[0])
}
