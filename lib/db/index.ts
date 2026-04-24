import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This is required for Next.js to not try to execute this at build time
// without having DATABASE_URL set. We'll fallback to a dummy URL if not set
// so the build doesn't fail, but it will fail at runtime if a real connection is made.
const sql = neon(process.env.NEON_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres');
export const db = drizzle(sql, { schema });
