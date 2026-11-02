import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
  const value = (await cookies()).get('user_session')?.value;
  if (!value) return NextResponse.json({ success: false, error: 'Sesión requerida' }, { status: 401 });

  try {
    const session = JSON.parse(value);
    const result = await db.query(`
      SELECT iu.id, iu.name, iu.email, iu.is_active, r.id AS role_id, r.name AS role_name,
             COALESCE(json_agg(json_build_object('code', p.code, 'description', p.description))
               FILTER (WHERE p.id IS NOT NULL), '[]') AS permissions
      FROM internal_users iu
      JOIN roles r ON r.id = iu.role_id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE iu.id = $1
      GROUP BY iu.id, r.id
    `, [session.id]);
    if (!result.rowCount || !result.rows[0].is_active) {
      return NextResponse.json({ success: false, error: 'Usuario inactivo' }, { status: 403 });
    }
    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch {
    return NextResponse.json({ success: false, error: 'Sesión inválida' }, { status: 401 });
  }
}
