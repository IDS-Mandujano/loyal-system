import { NextResponse } from 'next/server';
import { getUpcomingBirthdaysData } from '@/lib/services/fidelizationService';
import { validateBearerToken, handleCors } from '@/app/api/fidelizacion/validateToken';

export async function OPTIONS() {
  return handleCors();
}

export async function GET(request) {
  if (!(await validateBearerToken(request))) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const birthdays = await getUpcomingBirthdaysData();
    return NextResponse.json(birthdays, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error en endpoint cumpleaños:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}