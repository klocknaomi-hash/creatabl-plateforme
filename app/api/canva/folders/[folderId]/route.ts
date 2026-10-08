import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getValidCanvaToken } from '@/lib/canva-auth'

export const dynamic = 'force-dynamic'

// Designs d'un dossier Canva (nécessite le scope folder:read).
export async function GET(req: Request, { params }: { params: Promise<{ folderId: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessToken = await getValidCanvaToken(userId)
  if (!accessToken) return NextResponse.json({ error: 'Canva not connected or token expired' }, { status: 401 })

  const { folderId } = await params
  const { searchParams } = new URL(req.url)
  const qs = new URLSearchParams({ item_types: 'design' })
  const continuation = searchParams.get('continuation')
  if (continuation) qs.set('continuation', continuation)
  const sortBy = searchParams.get('sort_by')
  if (sortBy && ['modified_descending', 'modified_ascending', 'title_descending', 'title_ascending'].includes(sortBy)) qs.set('sort_by', sortBy)

  try {
    const res = await fetch(`https://api.canva.com/rest/v1/folders/${encodeURIComponent(folderId)}/items?${qs}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return NextResponse.json({ error: `Canva ${res.status}` }, { status: res.status })
    const data = await res.json()
    const items = (data.items ?? [])
      .filter((i: { type?: string }) => i.type === 'design')
      .map((i: { design: unknown }) => i.design)
    return NextResponse.json({ items, continuation: data.continuation ?? null })
  } catch (error) {
    console.error('[canva folder items] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
