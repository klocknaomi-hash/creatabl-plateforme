import { LinkedInClient } from '../lib/platforms/linkedin';

process.env.LINKEDIN_CLIENT_ID = '78r0syz2o47ly5';
process.env.NEXT_PUBLIC_APP_URL = 'https://app.creatabl-ia.com';

const client = new LinkedInClient();
console.log('Redirect URI:', (client as any).redirectUri);
console.log('Auth URL:', client.getAuthorizationUrl({ state: 'test_state' }));
