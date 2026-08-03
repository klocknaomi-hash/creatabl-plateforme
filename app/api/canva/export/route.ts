import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getValidCanvaToken } from '@/lib/canva-auth'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { designId, type = 'png' } = await req.json()

    if (!designId) {
      return NextResponse.json({ error: 'designId is required' }, { status: 400 })
    }

    const accessToken = await getValidCanvaToken(userId)

    if (!accessToken) {
      return NextResponse.json({ error: 'Canva not connected or token expired' }, { status: 401 })
    }

    const response = await fetch('https://api.canva.com/rest/v1/exports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        design_id: designId,
        format: {
          type: type
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Canva export API error:', errorData)
      return NextResponse.json({ error: 'Failed to start export' }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Canva export route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
