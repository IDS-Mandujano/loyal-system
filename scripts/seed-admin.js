import bcrypt from 'bcryptjs';
import db from '../lib/db.js';

async function seedAdmin() {
  const client = await db.getClient();
  try {
    const email = 'admin@loyal.com';
    const rawPassword = 'admin@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    await client.query(`
      INSERT INTO internal_users (name, email, password_hash, role_id, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    `, ['Administrador Principal', email, passwordHash, 1]);

    console.log('✅ Usuario Administrador creado exitosamente');
    console.log(`Email: ${email}`);
    console.log(`Password: ${rawPassword}`);
  } catch (err) {
    console.error('Error al crear admin:', err);
  } finally {
    client.release();
    process.exit();
  }
}

seedAdmin();