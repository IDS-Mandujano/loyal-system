import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { cookies } from 'next/headers';

async function verifyAuthAndPermission(client, sessionCookieValue) {
  try {
    const sessionData = JSON.parse(sessionCookieValue);
    const permissionCheck = await client.query(`
      SELECT 1 FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1 AND p.code = 'manage_users'
    `, [sessionData.roleId]);

    if (permissionCheck.rowCount === 0) return null;
    return sessionData;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');

  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  const client = await db.getClient();
  try {
    const session = await verifyAuthAndPermission(client, sessionCookie.value);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const result = await client.query(`
      SELECT id, name, created_at, last_used_at, is_active 
      FROM api_tokens 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      tokens: result.rows
    });
  } catch (error) {
    console.error('Error al listar tokens:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');

  if (!sessionCookie) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }

  const client = await db.getClient();
  try {
    const session = await verifyAuthAndPermission(client, sessionCookie.value);
    if (!session) {
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

    const result = await client.query(`
      INSERT INTO api_tokens (name, token_hash, created_by, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, name, created_at, is_active;
    `, [name.trim(), tokenHash, session.userId]);

    const newToken = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Token generado con éxito. Guárdalo ahora, no se volverá a mostrar.',
      token: rawToken,
      tokenDetails: newToken
    }, { status: 201 });

  } catch (error) {
    console.error('Error al generar token:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  } finally {
    client.release();
  }
}