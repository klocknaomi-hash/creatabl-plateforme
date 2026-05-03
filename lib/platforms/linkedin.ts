import { PlatformClient, SocialAccount } from './index';

export class LinkedInClient implements PlatformClient {
  private clientId = process.env.LINKEDIN_CLIENT_ID!;
  private clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  private get redirectUri() {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    
    // Fallback for Vercel environments
    if (!baseUrl && process.env.NEXT_PUBLIC_VERCEL_URL) {
      baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    if (!baseUrl) {
      console.warn('LinkedInClient: NEXT_PUBLIC_APP_URL is not configured. Falling back to localhost for development.');
      baseUrl = 'http://localhost:3000';
    }

    // Ensure it starts with http/https
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Ensure no trailing slash for consistency
    const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');
    return `${sanitizedBaseUrl}/api/oauth/linkedin/callback`;
  }

  getAuthorizationUrl(params?: { state?: string }): string {
    if (!this.clientId) {
      throw new Error('LinkedIn Client ID is missing. Please set LINKEDIN_CLIENT_ID in your environment variables.');
    }
    
    // We don't throw here anymore if NEXT_PUBLIC_APP_URL is missing, we use the fallback in redirectUri
    const scope = 'openid profile email w_member_social';
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', params?.state || 'static_state');
    
    return authUrl.toString();
  }

  async getTokens(code: string): Promise<any> {
    const currentRedirectUri = this.redirectUri;
    
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: currentRedirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('LinkedIn OAuth Token Exchange Failed:', {
        status: response.status,
        error: data.error,
        error_description: data.error_description,
        redirect_uri: currentRedirectUri,
      });
      throw new Error(`LinkedIn OAuth error: ${data.error_description || data.error || 'Failed to exchange code'}. Ensure ${currentRedirectUri} is registered in the LinkedIn Developer Portal.`);
    }
    
    // Fetch profile using OpenID Connect userinfo endpoint (modern way)
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profileRes.ok) {
      throw new Error(`LinkedIn profile error: ${profile.message || 'Failed to fetch profile'}`);
    }

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      platformUserId: profile.sub || profile.id,
      username: profile.name || `${profile.given_name} ${profile.family_name}` || 'LinkedIn User',
      avatarUrl: profile.picture || '',
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    throw new Error('LinkedIn does not provide refresh tokens for standard OAuth 2.0');
  }

  async publishPost(account: SocialAccount, content: string, mediaUrls?: string[]): Promise<string> {
    if (!account.accessToken) throw new Error('LinkedIn access token missing');
    if (!account.platformUserId) throw new Error('LinkedIn platform user ID missing');

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${account.platformUserId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LinkedIn publish failed: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }
  async fetchComments(account: SocialAccount, platformPostId: string): Promise<any[]> { return []; }
  async postReply(account: SocialAccount, platformCommentId: string, text: string): Promise<void> {}
  
  async fetchMetrics(account: SocialAccount, platformPostId: string): Promise<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }> {
    // LinkedIn API for metrics is quite complex, using mock data for now
    return {
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 10),
      shares: Math.floor(Math.random() * 5),
      reach: Math.floor(Math.random() * 500),
      impressions: Math.floor(Math.random() * 1000),
    };
  }
}
