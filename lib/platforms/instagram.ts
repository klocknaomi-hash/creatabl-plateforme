import { PlatformClient, SocialAccount } from './index';

export class InstagramClient implements PlatformClient {
  private clientId = process.env.FACEBOOK_CLIENT_ID!;
  private clientSecret = process.env.FACEBOOK_CLIENT_SECRET!;
  private get redirectUri() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    return `${baseUrl}/api/oauth/instagram/callback`;
  }

  getAuthorizationUrl(params?: { state?: string }): string {
    const scope = 'public_profile,email,instagram_basic,instagram_content_publish,instagram_manage_comments,pages_show_list,pages_read_engagement';
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${params?.state || ''}`;
  }

  async getTokens(code: string): Promise<any> {
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&client_secret=${this.clientSecret}&code=${code}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Instagram/Facebook OAuth error: ${data.error?.message || 'Failed to exchange code'}`);
    }

    // Fetch the first Instagram Business Account linked to any Facebook Page
    const pagesRes = await fetch(`https://graph.facebook.com/me/accounts?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${data.access_token}`);
    const pagesData = await pagesRes.json();
    
    if (!pagesRes.ok) {
      throw new Error(`Facebook Pages error: ${pagesData.error?.message || 'Failed to fetch pages'}`);
    }
    
    const igAccount = pagesData.data?.find((p: any) => p.instagram_business_account)?.instagram_business_account;

    if (!igAccount) {
      throw new Error('No Instagram Business Account linked to your Facebook Pages found.');
    }

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 5184000) * 1000),
      platformUserId: igAccount.id,
      username: igAccount.username,
      avatarUrl: igAccount.profile_picture_url,
    };
  }
  async refreshToken(refreshToken: string): Promise<any> { return {}; }
  async publishPost(account: SocialAccount, content: string): Promise<string> { return 'ig-id'; }
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
      likes: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 30),
      shares: Math.floor(Math.random() * 15),
      reach: Math.floor(Math.random() * 1500),
      impressions: Math.floor(Math.random() * 3000),
    };
  }
}
