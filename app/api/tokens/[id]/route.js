import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserPermission } from '@/lib/services/authService';
import { revokeApiToken } from '@/lib/services/tokenService';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Sesión inválida.' }, { status: 401 });
    }

    const hasPermission = await verifyUserPermission(sessionData.roleId, 'manage_users');
    if (!hasPermission) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const revokedToken = await revokeApiToken(id);

    if (!revokedToken) {
      return NextResponse.json({ success: false, error: 'Token no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token revocado correctamente.',
      token: revokedToken
    });

  } catch (error) {
    console.error('Error al revocar token:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}