import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('user_session');
  response.cookies.delete('client_token');
  return response;
}
