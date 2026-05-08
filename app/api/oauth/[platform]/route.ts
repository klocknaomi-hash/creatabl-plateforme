import { NextRequest, NextResponse } from 'next/server';
import { getPlatformClient } from '@/lib/platforms';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  
  if (platform === 'facebook' || platform === 'instagram') {
    return NextResponse.redirect(new URL('/api/oauth/facebook', request.nextUrl.origin));
  }
  
  try {
    const client = getPlatformClient(platform);
    
    // Generate a secure random state
    const state = crypto.randomBytes(16).toString('hex');
    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === 'production' || request.nextUrl.protocol === 'https:';
    
    // Store state in a cookie for verification on callback
    cookieStore.set(`${platform}_oauth_state`, state, {
      httpOnly: true,
      secure: isSecure,
      maxAge: 600, // 10 minutes
      path: '/',
      sameSite: isSecure ? 'none' : 'lax',
    });

    let url = '';
    
    if (platform === 'twitter') {
      // Twitter OAuth 2.0 PKCE
      const authResult = await client.getAuthorizationUrl({ state });
      if (typeof authResult === 'string') {
        url = authResult;
      } else {
        url = authResult.url;
        // Store code verifier for PKCE
        cookieStore.set('twitter_code_verifier', authResult.codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 600,
          path: '/',
          sameSite: 'lax',
        });
        // Override state cookie if Twitter returned a different one
        if (authResult.state) {
          cookieStore.set(`${platform}_oauth_state`, authResult.state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 600,
            path: '/',
            sameSite: 'lax',
          });
        }
      }
    } else {
      const authResult = await client.getAuthorizationUrl({ state });
      url = typeof authResult === 'string' ? authResult : authResult.url;
    }
    
    if (!url) {
      return NextResponse.json({ error: 'OAuth not configured for this platform' }, { status: 400 });
    }

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error(`OAuth error for ${platform}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
