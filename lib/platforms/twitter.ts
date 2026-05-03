import { PlatformClient, SocialAccount } from './index';
import { TwitterApi } from 'twitter-api-v2';

export class TwitterClient implements PlatformClient {
  private get redirectUri() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    return `${baseUrl}/api/oauth/twitter/callback`;
  }

  private getCredentials() {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Twitter credentials (TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET) are not configured in environment variables.');
    }

    return { clientId, clientSecret };
  }

  async getAuthorizationUrl(params?: { state?: string }): Promise<{ url: string; codeVerifier: string; state: string }> {
    const { clientId, clientSecret } = this.getCredentials();
    const client = new TwitterApi({
      clientId,
      clientSecret,
    });
    
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      this.redirectUri,
      { 
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        state: params?.state
      }
    );
    
    return {
      url,
      codeVerifier,
      state,
    };
  }

  async getTokens(code: string, codeVerifier?: string): Promise<any> {
    if (!codeVerifier) {
      throw new Error('Missing code verifier for Twitter OAuth 2.0');
    }

    const { clientId, clientSecret } = this.getCredentials();
    const client = new TwitterApi({
      clientId,
      clientSecret,
    });

    const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: this.redirectUri,
    });

    // Fetch user info
    const user = await loggedClient.v2.me({ 'user.fields': ['profile_image_url'] });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      platformUserId: user.data.id,
      username: user.data.username,
      avatarUrl: user.data.profile_image_url,
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const { clientId, clientSecret } = this.getCredentials();
    const client = new TwitterApi({
      clientId,
      clientSecret,
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(refreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    };
  }

  async publishPost(account: SocialAccount, content: string, mediaUrls?: string[]): Promise<string> {
    if (!account.accessToken) throw new Error('Twitter access token missing');
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content,
        reply_settings: 'everyone'
      })
    };

    const response = await fetch('https://api.x.com/2/tweets', options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Twitter API error: ${result.detail || result.title || response.statusText}`);
    }

    return result.data.id;
  }

  async fetchComments(account: SocialAccount, platformPostId: string): Promise<any[]> {
    return [];
  }

  async postReply(account: SocialAccount, platformCommentId: string, text: string): Promise<void> {
    if (!account.accessToken) throw new Error('Twitter access token missing');

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        reply: { in_reply_to_tweet_id: platformCommentId }
      })
    };

    const response = await fetch('https://api.x.com/2/tweets', options);
    if (!response.ok) {
      const result = await response.json();
      throw new Error(`Twitter API error: ${result.detail || result.title || response.statusText}`);
    }
  }

  async fetchMetrics(account: SocialAccount, platformPostId: string): Promise<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
  }> {
    if (!account.accessToken) throw new Error('Twitter access token missing');

    const response = await fetch(`https://api.x.com/2/tweets/${platformPostId}?tweet.fields=public_metrics,non_public_metrics`, {
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
      }
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(`Twitter API error: ${result.detail || result.title || response.statusText}`);
    }

    const { data } = await response.json();
    const publicMetrics = data.public_metrics || {};
    const nonPublicMetrics = data.non_public_metrics || {};

    return {
      likes: publicMetrics.like_count || 0,
      comments: publicMetrics.reply_count || 0,
      shares: publicMetrics.retweet_count || 0,
      reach: nonPublicMetrics.impression_count || 0, // Twitter calls it impressions
      impressions: nonPublicMetrics.impression_count || 0,
    };
  }
}
