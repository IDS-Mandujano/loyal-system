import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { hasPermission } from '@/lib/services/authService';

async function allowed() {
  const value = (await cookies()).get('user_session')?.value;
  if (!value) return false;
  try {
    return await hasPermission(JSON.parse(value).id, 'manage_users');
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  const [roles, permissions] = await Promise.all([
    db.query('SELECT id, name FROM roles ORDER BY id'),
    db.query('SELECT id, code, description FROM permissions ORDER BY id')
  ]);
  const assignments = await db.query(`
    SELECT rp.role_id, p.id, p.code, p.description
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    ORDER BY rp.role_id, p.id
  `);
  const rolesWithPermissions = roles.rows.map(role => ({
    ...role,
    permissions: assignments.rows.filter(permission => permission.role_id === role.id)
  }));
  return NextResponse.json({ roles: rolesWithPermissions, permissions: permissions.rows });
}

export async function POST(request) {
  if (!(await allowed())) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  const { name, permission_ids = [] } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'name requerido' }, { status: 400 });
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('roles', 'id'),
        COALESCE(MAX(id), 1),
        COUNT(*) > 0
      )
      FROM roles
    `);
    const role = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING id, name', [name.trim()]);
    for (const permissionId of permission_ids) {
      await client.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [role.rows[0].id, permissionId]);
    }
    await client.query('COMMIT');
    return NextResponse.json({ role: role.rows[0] }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando rol:', error);
    return NextResponse.json({
      error: error.code === '23505' ? 'Ya existe un rol con ese nombre' : 'No se pudo crear el rol'
    }, { status: 400 });
  } finally {
    client.release();
  }
}
