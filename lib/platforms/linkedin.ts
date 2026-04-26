import { PlatformClient, SocialAccount } from './index';

export class LinkedInClient implements PlatformClient {
  private clientId = process.env.LINKEDIN_CLIENT_ID!;
  private clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  private redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/linkedin/callback`;

  getAuthorizationUrl(params?: { state?: string }): string {
    const scope = 'r_liteprofile r_emailaddress w_member_social';
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scope)}&state=${params?.state || 'static_state'}`;
  }

  async getTokens(code: string): Promise<any> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const data = await response.json();
    
    // Fetch profile
    const profileRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const profile = await profileRes.json();

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      platformUserId: profile.id,
      username: `${profile.localizedFirstName} ${profile.localizedLastName}`,
      avatarUrl: '', // LinkedIn needs more complex fetching for avatar
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
