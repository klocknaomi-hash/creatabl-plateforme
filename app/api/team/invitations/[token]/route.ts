import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { workspaceMembers, workspaces } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // 1. Ensure user is authenticated and get their DB user record
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Find the workspace member record with this invitation token
    const member = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.invitationToken, token),
    })

    if (!member) {
      return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 })
    }

    if (member.status !== 'pending') {
      return NextResponse.json({ error: 'Cette invitation a déjà été acceptée ou déclinée' }, { status: 400 })
    }

    // 3. Check expiration
    if (member.invitationExpiresAt && new Date() > member.invitationExpiresAt) {
      return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 })
    }

    // 4. Update the member record
    await db
      .update(workspaceMembers)
      .set({
        userId: user.id,
        status: 'accepted',
        joinedAt: new Date(),
      })
      .where(eq(workspaceMembers.id, member.id))

    return NextResponse.json({ success: true, workspaceId: member.workspaceId })
  } catch (error: any) {
    console.error('[API invitations POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// GET to verify token status before accepting
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const member = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.invitationToken, token),
    })

    if (!member) {
      return NextResponse.json({ valid: false, error: 'Invitation introuvable' }, { status: 404 })
    }

    if (member.status !== 'pending') {
      return NextResponse.json({ valid: false, error: 'Cette invitation n\'est plus en attente' })
    }

    if (member.invitationExpiresAt && new Date() > member.invitationExpiresAt) {
      return NextResponse.json({ valid: false, error: 'Cette invitation a expiré' })
    }

    // Fetch workspace details if valid
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, member.workspaceId),
    })

    return NextResponse.json({
      valid: true,
      email: member.email,
      role: member.role,
      workspaceName: workspace?.name || 'Workspace',
    })
  } catch (error: any) {
    console.error('[API invitations GET] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
