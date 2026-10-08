import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getValidCanvaToken } from '@/lib/canva-auth'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getValidCanvaToken(userId)

    if (!accessToken) {
      return NextResponse.json({ error: 'Canva not connected or token expired' }, { status: 401 })
    }

    // Recherche, tri et pagination transmis à l'API Canva (designs du compte connecté).
    const { searchParams } = new URL(req.url)
    const params = new URLSearchParams()
    const query = searchParams.get('query')
    const sortBy = searchParams.get('sort_by')
    const continuation = searchParams.get('continuation')
    if (query) params.set('query', query.slice(0, 255))
    if (sortBy && ['relevance', 'modified_descending', 'modified_ascending', 'title_descending', 'title_ascending'].includes(sortBy)) params.set('sort_by', sortBy)
    if (continuation) params.set('continuation', continuation)
    const qs = params.toString()

    const response = await fetch(`https://api.canva.com/rest/v1/designs${qs ? `?${qs}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    const status = response.status
    const statusText = response.statusText
    const responseText = await response.text()
    
    if (!response.ok) console.log(`[canva designs] ${status} ${statusText}`)

    if (!response.ok) {
      console.error('Canva designs API error:', responseText)
      return NextResponse.json({ error: 'Failed to fetch designs', details: responseText }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Canva designs route:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 })
  }
}
