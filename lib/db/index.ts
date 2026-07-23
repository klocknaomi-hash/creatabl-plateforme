import { neon, Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

// Configure WebSocket for neon-serverless to support transactions
neonConfig.webSocketConstructor = ws;

let databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
// Clean connection string for neon-http HTTP client compatibility
databaseUrl = databaseUrl.replace('&channel_binding=require', '').replace('?channel_binding=require&', '?');

// 1. Connection neon-http pour les requêtes simples (sans transactions)
const sql = neon(databaseUrl);
export const db = drizzleHttp(sql, { schema });

// 2. Connection neon-serverless (Pool + WebSocket) dédiée aux transactions
const pool = new Pool({ connectionString: databaseUrl });
export const dbTransactional = drizzleServerless(pool, { schema });
