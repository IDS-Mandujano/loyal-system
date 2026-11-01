import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function DELETE(request, { params }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');

  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  const client = await db.getClient();
  try {
    const sessionData = JSON.parse(sessionCookie.value);
    
    const permissionCheck = await client.query(`
      SELECT 1 FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1 AND p.code = 'manage_users'
    `, [sessionData.roleId]);

    if (permissionCheck.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const result = await client.query(`
      UPDATE api_tokens 
      SET is_active = FALSE 
      WHERE id = $1 
      RETURNING id, name, is_active;
    `, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Token no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token revocado correctamente.',
      token: result.rows[0]
    });

  } catch (error) {
    console.error('Error al revocar token:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    client.release();
  }
}