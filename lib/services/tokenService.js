import db from '@/lib/db';

export async function revokeApiToken(tokenId) {
  const client = await db.getClient();
  try {
    const result = await client.query(`
      UPDATE api_tokens 
      SET is_active = FALSE 
      WHERE id = $1 
      RETURNING id, name, is_active;
    `, [tokenId]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getApiTokens() {
  const client = await db.getClient();
  try {
    const result = await client.query(`
      SELECT id, name, created_at, last_used_at, is_active 
      FROM api_tokens 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function createApiToken(name, tokenHash, userId) {
  const client = await db.getClient();
  try {
    const result = await client.query(`
      INSERT INTO api_tokens (name, token_hash, created_by, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, name, created_at, is_active;
    `, [name, tokenHash, userId]);
    return result.rows[0];
  } finally {
    client.release();
  }
}