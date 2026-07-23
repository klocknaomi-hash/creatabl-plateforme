import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { workspaceMembers, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentWorkspace } from '@/lib/workspaces'
import { checkPlanLimit } from '@/lib/plans/check-limit'
import { sendTeamInvitation } from '@/lib/email'
import crypto from 'crypto'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const limitResult = await checkPlanLimit(userId, 'teamMembers');
    if (limitResult.limit <= 1) {
      return Response.json(
        { error: 'Gestion équipe nécessite le plan Business.' },
        { status: 403 }
      )
    }

    const workspace = await getCurrentWorkspace(userId)
    let members = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, workspace.id),
    })

    // If no members exist, auto-add the owner
    if (members.length === 0) {
      const ownerUser = await db.query.users.findFirst({
        where: eq(users.id, workspace.ownerId),
      })
      if (ownerUser) {
        await db.insert(workspaceMembers).values({
          workspaceId: workspace.id,
          email: ownerUser.email,
          userId: ownerUser.id,
          role: 'owner',
          status: 'active',
        })

        // Refetch members
        members = await db.query.workspaceMembers.findMany({
          where: eq(workspaceMembers.workspaceId, workspace.id),
        })
      }
    }

    // Fetch user profiles for members who have a userId to get their names
    const userIds = members.map(m => m.userId).filter((id): id is string => !!id)
    const userProfiles: Record<string, { name: string | null; email: string }> = {}

    if (userIds.length > 0) {
      const dbUsers = await db.query.users.findMany({
        where: (users, { inArray }) => inArray(users.id, userIds),
      })
      dbUsers.forEach(u => {
        userProfiles[u.id] = {
          name: u.name,
          email: u.email,
        }
      })
    }

    const result = members.map(m => {
      const profile = m.userId ? userProfiles[m.userId] : null
      return {
        ...m,
        name: profile?.name || m.email.split('@')[0],
      }
    })

    return Response.json(result)
  } catch (error: any) {
    console.error('[API members GET] Error:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const limitResult = await checkPlanLimit(userId, 'teamMembers');
    if (!limitResult.allowed) {
      return Response.json(
        {
          error: "limit_reached",
          limit: "teamMembers",
          upgradeUrl: "/pricing",
          message: `Limite de membres d'équipe atteinte (${limitResult.current}/${limitResult.limit}). Passe au plan supérieur pour continuer.`
        },
        { status: 402 }
      );
    }

    const { email, role } = await req.json()
    if (!email || !role) {
      return Response.json({ error: 'L\'email et le rôle sont requis.' }, { status: 400 })
    }

    const workspace = await getCurrentWorkspace(userId)

    // Check if duplicate invitation/membership exists in this workspace
    const existing = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.email, email.trim().toLowerCase())
      ),
    })

    if (existing) {
      return Response.json(
        { error: 'Cet utilisateur fait déjà partie de l\'équipe ou a déjà été invité.' },
        { status: 400 }
      )
    }

    // Insert new workspace member with pending status
    // If the user already exists in our system, associate their userId
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.trim().toLowerCase()),
    })

    const invitationToken = crypto.randomBytes(32).toString('hex')
    const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000)

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      email: email.trim().toLowerCase(),
      userId: existingUser ? existingUser.id : null,
      role,
      status: 'pending',
      invitationToken,
      invitationExpiresAt,
    })

    // Fetch current user details for inviter name
    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    })
    const inviterName = currentUser?.name || currentUser?.email || 'Un membre de l\'équipe'

    // Send invitation email
    await sendTeamInvitation({
      toEmail: email.trim().toLowerCase(),
      inviterName,
      workspaceName: workspace.name,
      role,
      invitationToken,
    })
    
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('[API members POST] Error:', error)
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
