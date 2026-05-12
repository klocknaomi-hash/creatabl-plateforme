import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPlatformClient } from '@/lib/platforms'

export async function GET(req: NextRequest) {
  console.log('LINKEDIN REDIRECT URI:', process.env.LINKEDIN_REDIRECT_URI)
  console.log('LINKEDIN CLIENT ID:', process.env.LINKEDIN_CLIENT_ID ? 'SET' : 'MISSING')

  try {
    const client = getPlatformClient('linkedin')
    const state = crypto.randomBytes(16).toString('hex')
    
    const authUrlData = await client.getAuthorizationUrl({ state })
    const authUrl = typeof authUrlData === 'string' ? authUrlData : authUrlData.url

    console.log('FULL LINKEDIN URL:', authUrl.toString())

    const response = NextResponse.redirect(authUrl)
    
    // Store state in cookie for validation in callback
    response.cookies.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })

    return response
  } catch (error: any) {
    console.error(`LinkedIn OAuth Initiation Error:`, error)
    return NextResponse.json(
      { error: `Failed to initiate LinkedIn OAuth: ${error.message}` },
      { status: 400 }
    )
  }
}
