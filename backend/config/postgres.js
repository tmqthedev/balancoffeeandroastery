const { Pool } = require('pg');
const { getRuntimeConfig } = require('./runtimeConfig');

let pool = null;

function normalizePostgresConnectionString(uri) {
  const url = new URL(uri);
  const sslMode = url.searchParams.get('sslmode');

  if (!sslMode || ['prefer', 'require', 'verify-ca', 'verify-full'].includes(sslMode)) {
    url.searchParams.set('sslmode', process.env.POSTGRES_SSLMODE || 'no-verify');
  }

  return url.toString();
}

async function getPostgresPool() {
  if (pool) {
    return pool;
  }

  const config = await getRuntimeConfig();
  pool = new Pool({
    connectionString: normalizePostgresConnectionString(config.postgresUri),
    max: process.env.NODE_ENV === 'production' ? 5 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  return pool;
}

async function query(text, params = []) {
  const postgresPool = await getPostgresPool();
  return postgresPool.query(text, params);
}

async function testPostgresConnection() {
  const result = await query('SELECT current_database() AS database, now() AS timestamp');
  return result.rows[0];
}

async function closePostgresPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPostgresPool,
  query,
  testPostgresConnection,
  closePostgresPool
};
