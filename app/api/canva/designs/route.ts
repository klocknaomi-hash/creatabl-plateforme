import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getValidCanvaToken } from '@/lib/canva-auth'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accessToken = await getValidCanvaToken(userId)

    if (!accessToken) {
      return NextResponse.json({ error: 'Canva not connected or token expired' }, { status: 401 })
    }

    const response = await fetch('https://api.canva.com/rest/v1/designs', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Canva designs API error:', errorData)
      return NextResponse.json({ error: 'Failed to fetch designs' }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Canva designs route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
