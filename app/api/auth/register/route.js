import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Falta sesión.' },
        { status: 401 }
      );
    }

    let sessionData;
    try {

      sessionData = JSON.parse(sessionCookie.value);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida.' },
        { status: 401 }
      );
    }

    const client = await db.getClient();
    try {
      const permissionCheck = await client.query(`
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = $1 AND p.code = 'manage_users'
      `, [sessionData.roleId]);

      if (permissionCheck.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Acceso denegado. No tienes permisos para registrar usuarios.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { name, email, password, role_id } = body;

      if (!name || !email || !password || !role_id) {
        return NextResponse.json(
          { success: false, error: 'Todos los campos (name, email, password, role_id) son obligatorios.' },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await client.query(`
        INSERT INTO internal_users (name, email, password_hash, role_id, is_active)
        VALUES ($1, $2, $3, $4, TRUE)
        RETURNING id, name, email, role_id, created_at;
      `, [name, email, passwordHash, role_id]);

      const newUser = result.rows[0];

      return NextResponse.json({
        success: true,
        message: 'Usuario registrado con éxito',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roleId: newUser.role_id,
          createdAt: newUser.created_at
        }
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (err) {
    console.error('❌ Error en el registro de usuario:', err);
    
    if (err.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico ya está registrado.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}