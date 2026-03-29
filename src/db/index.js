import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[DB] DATABASE_URL is not set. Database features will fail until configured.');
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function testDbConnection() {
  if (!connectionString) return false;

  try {
    const result = await pool.query('SELECT 1 as connected');
    return result.rows[0]?.connected === 1;
  } catch (error) {
    console.error('[DB] Connection test failed:', error.message);
    return false;
  }
}

export async function logInboundEvent(payload) {
  if (!connectionString) return false;

  const sql = `
    CREATE TABLE IF NOT EXISTS webhook_events (
      id BIGSERIAL PRIMARY KEY,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT,
      payload JSONB NOT NULL
    );
  `;

  const insertSql = 'INSERT INTO webhook_events(source, payload) VALUES($1, $2::jsonb)';

  try {
    await pool.query(sql);
    await pool.query(insertSql, ['whatsapp', JSON.stringify(payload)]);
    return true;
  } catch (error) {
    console.error('[DB] Failed to persist webhook event:', error.message);
    return false;
  }
}
