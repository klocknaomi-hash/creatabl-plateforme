import { db } from '@/lib/db'
import { workspaces, users, workspaceMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Retrieves the current workspace for the given Clerk user ID.
 * If the user does not own any workspaces, checks if they are a member of one.
 * If no workspace is found, automatically creates a default workspace to prevent errors.
 */
export async function getCurrentWorkspace(clerkId: string) {
  // 1. Resolve Clerk user ID to database user UUID
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })
  if (!user) {
    throw new Error('User not found')
  }

  // 2. Look for any workspace where the user is the owner
  let workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.ownerId, user.id),
  })

  // 3. If none found, look for any workspace where the user is a member
  if (!workspace) {
    const memberRecord = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, user.id),
    })
    if (memberRecord) {
      workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, memberRecord.workspaceId),
      })
    }
  }

  // 4. If still none found, auto-create a default workspace for the user
  if (!workspace) {
    const name = user.name ? `${user.name}'s Workspace` : 'Mon espace'
    const [newWs] = await db
      .insert(workspaces)
      .values({
        name,
        ownerId: user.id,
      })
      .returning()
    workspace = newWs
  }

  return workspace
}
