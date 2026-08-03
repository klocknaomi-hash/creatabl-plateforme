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

    const status = response.status
    const statusText = response.statusText
    const responseText = await response.text()
    
    console.log('--- CANVA API DIAGNOSTIC ---')
    console.log(`Status: ${status} ${statusText}`)
    console.log(`Body: ${responseText}`)
    console.log('-----------------------------')

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
