import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { verifyUserPermission } from '@/lib/services/authService';
import { getApiTokens, createApiToken } from '@/lib/services/tokenService';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, error: 'Sesión inválida.' }, { status: 401 });
    }

    const hasPermission = await verifyUserPermission(sessionData.roleId, 'manage_users');
    if (!hasPermission) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const tokens = await getApiTokens();

    return NextResponse.json({
      success: true,
      tokens
    });
  } catch (error) {
    console.error('Error al listar tokens:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, error: 'Sesión inválida.' }, { status: 401 });
    }

    const hasPermission = await verifyUserPermission(sessionData.roleId, 'manage_users');
    if (!hasPermission) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Cuerpo de la petición JSON inválido o vacío.' }, { status: 400 });
    }

    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'El nombre o descripción del token es obligatorio.' }, { status: 400 });
    }

    const rawToken = `loyal_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const newToken = await createApiToken(name.trim(), tokenHash, sessionData.id || sessionData.userId);

    return NextResponse.json({
      success: true,
      message: 'Token generado con éxito. Guárdalo ahora, no se volverá a mostrar.',
      token: rawToken,
      tokenDetails: newToken
    }, { status: 201 });

  } catch (error) {
    console.error('Error al generar token:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}