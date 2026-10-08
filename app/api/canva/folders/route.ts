import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getValidCanvaToken } from '@/lib/canva-auth'

export const dynamic = 'force-dynamic'

// Dossiers du compte Canva connecté (racine du projet). Sans le scope folder:read,
// Canva répond 403 : le sélecteur affiche alors seulement « Tous les designs ».
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessToken = await getValidCanvaToken(userId)
  if (!accessToken) return NextResponse.json({ error: 'Canva not connected or token expired' }, { status: 401 })

  try {
    const res = await fetch('https://api.canva.com/rest/v1/folders/root/items?item_types=folder', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.status === 403 || res.status === 401) {
      return NextResponse.json({ folders: [], available: false })
    }
    if (!res.ok) {
      return NextResponse.json({ folders: [], available: false, error: `Canva ${res.status}` })
    }
    const data = await res.json()
    const folders = (data.items ?? [])
      .filter((i: { type?: string }) => i.type === 'folder')
      .map((i: { folder: { id: string; name: string } }) => ({ id: i.folder.id, name: i.folder.name }))
    return NextResponse.json({ folders, available: true })
  } catch (error) {
    console.error('[canva folders] error:', error)
    return NextResponse.json({ folders: [], available: false })
  }
}
