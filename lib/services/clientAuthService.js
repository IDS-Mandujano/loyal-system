import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function authenticateClient(email, password) {
  const client = await db.getClient();
  try {
    const result = await client.query(`
      SELECT id, name, email, portal_password_hash, must_change_password, points, tier
      FROM users
      WHERE email = $1
    `, [email]);

    if (result.rowCount === 0) return null;

    const user = result.rows[0];

    if (!user.portal_password_hash) {
      return { error: 'Acceso no generado. Solicítalo al equipo interno.' };
    }

    const isValid = await bcrypt.compare(password, user.portal_password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      must_change_password: user.must_change_password,
      points: user.points,
      tier: user.tier
    };
  } finally {
    client.release();
  }
}

export async function updateClientPassword(clientId, newPassword) {
  const client = await db.getClient();
  try {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await client.query(`
      UPDATE users
      SET portal_password_hash = $1,
          must_change_password = FALSE,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, must_change_password
    `, [passwordHash, clientId]);

    if (result.rowCount === 0) {
      throw new Error('Cliente no encontrado.');
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}