import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client pool', err);
});

export const query = async <T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (env.NODE_ENV === 'development') {
    console.debug('Executed DB Query', { text, duration, rows: res.rowCount });
  }
  return res;
};

export const getClient = async (): Promise<pg.PoolClient> => {
  return await pool.connect();
};

