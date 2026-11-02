import db from '@/lib/db';

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      identifier VARCHAR(320) NOT NULL,
      account_type VARCHAR(20) NOT NULL,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (identifier, account_type)
    )
  `);
}

function normalize(identifier) {
  return identifier.trim().toLowerCase();
}

export async function getLoginLock(identifier, accountType) {
  await ensureTable();
  const result = await db.query(
    `SELECT locked_until FROM login_attempts WHERE identifier = $1 AND account_type = $2`,
    [normalize(identifier), accountType]
  );
  const lockedUntil = result.rows[0]?.locked_until;
  if (!lockedUntil || new Date(lockedUntil) <= new Date()) return null;
  return new Date(lockedUntil);
}

export async function recordFailedLogin(identifier, accountType) {
  await ensureTable();
  const result = await db.query(
    `INSERT INTO login_attempts (identifier, account_type, failed_attempts, locked_until, updated_at)
     VALUES ($1, $2, 1, NULL, NOW())
     ON CONFLICT (identifier, account_type) DO UPDATE
     SET failed_attempts = CASE
           WHEN login_attempts.locked_until IS NOT NULL AND login_attempts.locked_until <= NOW() THEN 1
           ELSE login_attempts.failed_attempts + 1
         END,
         locked_until = CASE
           WHEN login_attempts.locked_until IS NULL
             AND login_attempts.failed_attempts + 1 >= $3 THEN NOW() + ($4 * INTERVAL '1 minute')
           ELSE NULL
         END,
         updated_at = NOW()
     RETURNING failed_attempts, locked_until`,
    [normalize(identifier), accountType, MAX_ATTEMPTS, LOCK_MINUTES]
  );
  return result.rows[0];
}

export async function clearLoginFailures(identifier, accountType) {
  await ensureTable();
  await db.query(
    `DELETE FROM login_attempts WHERE identifier = $1 AND account_type = $2`,
    [normalize(identifier), accountType]
  );
}

export { LOCK_MINUTES, MAX_ATTEMPTS };
