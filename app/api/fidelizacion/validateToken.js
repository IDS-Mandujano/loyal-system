import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export function handleCors() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}

export async function validateBearerToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[Auth] Header faltante o sin formato Bearer');
    return false;
  }

  const token = authHeader.split(' ')[1];
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  console.log('[Auth] Token recibido en plano:', token);
  console.log('[Auth] Hash calculado:', tokenHash);

  const client = await db.getClient();
  try {
    const result = await client.query(
      `SELECT * FROM api_tokens WHERE token_hash = $1 AND is_active = TRUE`,
      [tokenHash]
    );

    console.log('[Auth] Registros coincidentes en BD:', result.rows.length);
    if (result.rows.length === 0) {

      const allTokens = await client.query(`SELECT id, name, token_hash, is_active FROM api_tokens`);
      console.log('[Auth] Tokens actuales en la BD:', allTokens.rows);
    }

    return result.rows.length > 0;
  } catch (e) {
    console.error('[Auth] Error en consulta SQL:', e);
    return false;
  } finally {
    client.release();
  }
}