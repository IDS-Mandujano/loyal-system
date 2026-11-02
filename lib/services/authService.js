import db from "../db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function authenticateInternalUser(email, password) {
    const client = await db.getClient();
    try {
        const result = await client.query(`
            SELECT iu.id, iu.name, iu.email, iu.password_hash, iu.is_active, r.id as role_id, r.name as role_name
            FROM internal_users iu
            JOIN roles r ON iu.role_id = r.id
            WHERE iu.email = $1
        `, [email]);

        if (result.rowCount === 0) return null;

        const user = result.rows[0];
        if (!user.is_active) throw new Error('Usuario desactivado');

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        delete user.password_hash;
        return user;
    } finally {
        client.release();
    }
}

export async function hasPermission(userId, permissionCode) {
    const client = await db.getClient();

    try {
        const result = await client.query(`
            SELECT 1 
            FROM internal_users iu
            JOIN role_permissions rp ON iu.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE iu.id = $1 AND p.code = $2 AND iu.is_active = TRUE
        `, [userId, permissionCode]);

        return result.rowCount > 0;
    } finally {
        client.release();
    }
}

export async function verifyUserPermission(roleId, permissionCode) {
  const client = await db.getClient();
  try {
    const result = await client.query(`
      SELECT 1 FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1 AND p.code = $2
    `, [roleId, permissionCode]);
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}

export async function verifyExternalApiToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const client = await db.getClient();
  try {
    const result = await client.query(
      `SELECT * FROM api_tokens WHERE token_hash = $1 AND is_active = TRUE`,
      [tokenHash]
    );
    return result.rows.length > 0;
  } catch (e) {
    console.error('[Auth] Error en consulta SQL de tokens:', e);
    return false;
  } finally {
    client.release();
  }
}

export async function createUser({ name, email, password, role_id }) {
  const client = await db.getClient();
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await client.query(`
      INSERT INTO internal_users (name, email, password_hash, role_id, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id, name, email, role_id, created_at;
    `, [name, email, passwordHash, role_id]);

    return result.rows[0];
  } finally {
    client.release();
  }
}