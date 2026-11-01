import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import bcrypt from 'bcryptjs';
import db from '../lib/db.js';

async function seedAdmin() {

  const client = await db.getClient();
  try {
    console.log('Conectando a la base de datos...');
    
    const roleCheck = await client.query('SELECT id FROM roles WHERE id = 1');
    if (roleCheck.rowCount === 0) {
      console.error('Error: El rol con ID 1 (Administrador) no existe en la tabla "roles".');
      return;
    }

    const email = 'admin@loyal.com';
    const rawPassword = 'AdminPassword123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const result = await client.query(`
      INSERT INTO internal_users (name, email, password_hash, role_id, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = EXCLUDED.password_hash, role_id = EXCLUDED.role_id
      RETURNING id, email;
    `, ['Administrador Principal', email, passwordHash, 1]);

    console.log('¡Usuario Administrador insertado o actualizado con éxito!');
    console.log(`- Email: ${email}`);
    console.log(`- Password: ${rawPassword}`);
    console.log(`- ID en BD: ${result.rows[0].id}`);

  } catch (err) {
    console.error('Error crítico al ejecutar el script:', err.message);
  } finally {
    client.release();
    process.exit();
  }
}

seedAdmin();