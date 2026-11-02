import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { hasPermission, createUser } from '@/lib/services/authService';

async function admin() {
  const value = (await cookies()).get('user_session')?.value;
  if (!value) return null;
  try {
    const session = JSON.parse(value);
    return await hasPermission(session.id, 'manage_users') ? session : null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  const result = await db.query(`
    SELECT iu.id, iu.name, iu.email, iu.is_active, iu.role_id, r.name AS role_name
    FROM internal_users iu JOIN roles r ON r.id = iu.role_id ORDER BY iu.id
  `);
  return NextResponse.json({ users: result.rows });
}

export async function POST(request) {
  if (!(await admin())) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.password || !body.role_id) {
      return NextResponse.json({ error: 'name, email, password y role_id son obligatorios' }, { status: 400 });
    }
    return NextResponse.json({ user: await createUser(body) }, { status: 201 });
  } catch (error) {
    console.error('Error creando usuario interno:', error);
    return NextResponse.json({ error: error.code === '23505' ? 'El correo ya existe' : 'No se pudo crear el usuario' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const session = await admin();
  if (!session) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  const { id, is_active, role_id, name } = await request.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
  if (Number(id) === Number(session.id) && is_active === false) {
    return NextResponse.json({ error: 'No puedes desactivarte a ti mismo' }, { status: 400 });
  }
  const result = await db.query(`
    UPDATE internal_users SET name = COALESCE($1, name), role_id = COALESCE($2, role_id),
      is_active = COALESCE($3, is_active) WHERE id = $4
      RETURNING id, name, email, role_id, is_active
  `, [name || null, role_id || null, typeof is_active === 'boolean' ? is_active : null, id]);
  return result.rowCount ? NextResponse.json({ user: result.rows[0] }) : NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
}
