import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

const needsSsl =
  process.env.DATABASE_SSL === 'true' ||
  /sslmode=require/i.test(config.databaseUrl) ||
  /neon\.tech/i.test(config.databaseUrl);

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

export function query(text, params) {
  return pool.query(text, params);
}
