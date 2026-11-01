import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDashboardMetrics } from '@/lib/services/customerService';

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

    const metrics = await getDashboardMetrics();

    return NextResponse.json({
      success: true,
      ...metrics
    });

  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}