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
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    return token ? verifyExternalApiToken(token) : false;
  }

  // Internal users can use the customer detail screen; external consumers
  // must still provide the generated API token.
  const session = (await cookies()).get('user_session')?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return Boolean(data.id);
  } catch {
    return false;
  }
}