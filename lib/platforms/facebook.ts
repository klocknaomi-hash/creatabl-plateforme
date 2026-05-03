import { PlatformClient, SocialAccount } from './index';

export class FacebookClient implements PlatformClient {
  private clientId = process.env.FACEBOOK_CLIENT_ID!;
  private clientSecret = process.env.FACEBOOK_CLIENT_SECRET!;
  private get redirectUri() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    return `${baseUrl}/api/oauth/facebook/callback`;
  }

  getAuthorizationUrl(params?: { state?: string }): string {
    const scope = 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts';
    console.log('Facebook Redirect URI:', this.redirectUri);
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${params?.state || ''}`;
  }

  async getTokens(code: string): Promise<any> {
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&client_secret=${this.clientSecret}&code=${code}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Facebook OAuth error: ${data.error?.message || 'Failed to exchange code'}`);
    }

    // Fetch user info
    const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${data.access_token}`);
    const me = await meRes.json();

    if (!meRes.ok) {
      throw new Error(`Facebook profile error: ${me.error?.message || 'Failed to fetch profile'}`);
    }

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000), // Default 60 days if not provided
      platformUserId: me.id,
      username: me.name,
      avatarUrl: me.picture?.data?.url,
    };
  }
  async refreshToken(refreshToken: string): Promise<any> { return {}; }
  async publishPost(account: SocialAccount, content: string): Promise<string> { return 'fb-id'; }
  async fetchComments(account: SocialAccount, platformPostId: string): Promise<any[]> { return []; }
  async postReply(account: SocialAccount, platformCommentId: string, text: string): Promise<void> {}
  async fetchMetrics(account: SocialAccount, platformPostId: string): Promise<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }> {
    return {
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 10),
      reach: Math.floor(Math.random() * 1000),
      impressions: Math.floor(Math.random() * 2000),
    };
  }
}
