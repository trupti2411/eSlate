import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isNeon = process.env.DATABASE_URL.includes('neon.tech');

export const pool = isNeon
  ? (() => { neonConfig.webSocketConstructor = ws; return new Pool({ connectionString: process.env.DATABASE_URL }); })()
  : new pg.Pool({ connectionString: process.env.DATABASE_URL! });

export const db = isNeon
  ? drizzleNeon({ client: pool as Pool, schema })
  : drizzlePg({ client: pool as pg.Pool, schema });