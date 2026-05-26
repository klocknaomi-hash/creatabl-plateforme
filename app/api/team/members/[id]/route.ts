import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { workspaceMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentWorkspace } from '@/lib/workspaces'
import { getAccess } from '@/lib/get-access'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await getAccess()
    if (!access.team) {
      return Response.json(
        { error: 'Gestion équipe nécessite le plan Business.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { role } = await req.json()

    if (!role) {
      return Response.json({ error: 'Le rôle est requis.' }, { status: 400 })
    }

    const workspace = await getCurrentWorkspace(userId)

    // Update the role of the member within the current workspace
    const result = await db
      .update(workspaceMembers)
      .set({ role })
      .where(
        and(
          eq(workspaceMembers.id, id),
          eq(workspaceMembers.workspaceId, workspace.id)
        )
      )
      .returning()

    if (result.length === 0) {
      return Response.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('[API member PATCH] Error:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const access = await getAccess()
    if (!access.team) {
      return Response.json(
        { error: 'Gestion équipe nécessite le plan Business.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const workspace = await getCurrentWorkspace(userId)

    // Delete the member within the current workspace
    const result = await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, id),
          eq(workspaceMembers.workspaceId, workspace.id)
        )
      )
      .returning()

    if (result.length === 0) {
      return Response.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('[API member DELETE] Error:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
