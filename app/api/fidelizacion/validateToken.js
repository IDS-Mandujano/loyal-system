import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyExternalApiToken } from '@/lib/services/authService';

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
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    if (sessionCookie && sessionCookie.value) {
      const sessionData = JSON.parse(sessionCookie.value);
      if (sessionData && sessionData.id) {
        return true;
      }
    }
  } catch (cookieError) {
    console.error('[Auth] Error leyendo cookie de sesión:', cookieError);
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  return await verifyExternalApiToken(token);
}