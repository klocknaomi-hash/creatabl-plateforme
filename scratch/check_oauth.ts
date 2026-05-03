import { LinkedInClient } from '../lib/platforms/linkedin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new LinkedInClient();
console.log('Redirect URI:', client['redirectUri']);
console.log('Auth URL:', client.getAuthorizationUrl({ state: 'test' }));
