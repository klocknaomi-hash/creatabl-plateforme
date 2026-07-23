import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { workspaces, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkPlanLimit } from '@/lib/plans/check-limit'

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

  // Check workspace limit dynamically
  const limitResult = await checkPlanLimit(userId, 'workspaces');
  if (!limitResult.allowed) {
    return Response.json(
      {
        error: "limit_reached",
        limit: "workspaces",
        upgradeUrl: "/pricing",
        message: `Limite de workspaces atteinte (${limitResult.current}/${limitResult.limit}). Passe au plan supérieur pour continuer.`
      },
      { status: 402 }
    );
  }

  // Resolve Clerk userId to DB UUID
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
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
