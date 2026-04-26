import { PlatformClient, SocialAccount } from './index';

export class YouTubeClient implements PlatformClient {
  private clientId = process.env.GOOGLE_CLIENT_ID!;
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  private redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/youtube/callback`;

  getAuthorizationUrl(params?: { state?: string }): string {
    const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile';
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent&state=${params?.state || ''}`;
  }

  async getTokens(code: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const data = await response.json();

    // Fetch user info
    const meRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const me = await meRes.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      platformUserId: me.sub,
      username: me.name,
      avatarUrl: me.picture,
    };
  }
  async refreshToken(refreshToken: string): Promise<any> { return {}; }
  async publishPost(account: SocialAccount, content: string): Promise<string> { return 'yt-id'; }
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
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      reach: Math.floor(Math.random() * 5000),
      impressions: Math.floor(Math.random() * 10000),
    };
  }
}
