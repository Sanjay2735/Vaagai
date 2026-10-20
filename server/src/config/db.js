import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from process.cwd() as well as server/.env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// Build PostgreSQL Pool Configuration
const poolConfig = {};

// Validate DATABASE_URL protocol
if (hasDatabaseUrl) {
  const dbUrl = process.env.DATABASE_URL.trim();

  if (dbUrl.startsWith('http://') || dbUrl.startsWith('https://')) {
    console.error('\n⚠️  [CONFIGURATION WARNING] ⚠️');
    console.error('DATABASE_URL is set to an HTTP/HTTPS Web URL (' + dbUrl + ').');
    console.error('PostgreSQL requires a direct database connection string starting with "postgresql://" or "postgres://".');
    console.error('For Supabase, copy the URI from: Project Settings -> Database -> Connection String -> URI.');
    console.error('Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\n');
  }

  poolConfig.connectionString = dbUrl;

  // Auto-enable SSL for remote/cloud hosts (e.g., neon.tech, supabase.co, pooler.supabase.com, render.com, aws, etc.)
  const isCloudHost =
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('supabase.co') ||
    dbUrl.includes('supabase.com') ||
    dbUrl.includes('sslmode=require') ||
    dbUrl.includes('render.com') ||
    process.env.PGSSL === 'true';

  if (isCloudHost) {
    poolConfig.ssl = {
      rejectUnauthorized: false,
    };
  }
} else {
  poolConfig.host = process.env.PGHOST || 'localhost';
  poolConfig.port = Number(process.env.PGPORT) || 5432;
  poolConfig.user = process.env.PGUSER || 'postgres';
  poolConfig.password = process.env.PGPASSWORD || 'postgres';
  poolConfig.database = process.env.PGDATABASE || 'vaagai_db';

  if (process.env.PGSSL === 'true') {
    poolConfig.ssl = {
      rejectUnauthorized: false,
    };
  }
}

// Pool tuning
poolConfig.max = 20;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 5000;

export const pool = new Pool(poolConfig);

// Pool event listeners
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

/**
 * Executes a parameterized SQL query on the PostgreSQL pool.
 * @param {string} text - SQL statement with $1, $2 parameters
 * @param {Array} params - Array of parameter values
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      // debug log for slow queries (> 200ms)
      if (duration > 200) {
        console.warn(`[Slow Query] ${duration}ms: ${text.slice(0, 100)}`);
      }
    }
    return res;
  } catch (error) {
    console.error(`[Database Query Error]: ${error.message} \nQuery: ${text}`);
    throw error;
  }
}

/**
 * Checks PostgreSQL database connectivity.
 * @returns {Promise<{ ok: boolean, message: string, now?: string }>}
 */
export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    return {
      ok: true,
      message: `Connected successfully to PostgreSQL database "${res.rows[0].db}"`,
      now: res.rows[0].now,
      database: res.rows[0].db,
    };
  } catch (error) {
    let detailedError = error.message;
    if (!detailedError && Array.isArray(error.errors) && error.errors.length > 0) {
      detailedError = error.errors.map((e) => e.message || e.code).join(', ');
    } else if (!detailedError) {
      detailedError = error.code || String(error);
    }

    if (error.code === 'ECONNREFUSED') {
      detailedError = `Connection refused (${detailedError}). Verify your host, port, and that your database is running or connection string is correct.`;
    }

    return {
      ok: false,
      message: `Failed to connect to PostgreSQL: ${detailedError}`,
      error: detailedError,
    };
  }
}

export default {
  pool,
  query,
  testConnection,
};
