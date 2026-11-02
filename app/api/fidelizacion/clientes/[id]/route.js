import { NextResponse } from 'next/server';
import { getClientFidelizationData } from '@/lib/services/fidelizationService';
import { validateBearerToken, handleCors } from '@/app/api/fidelizacion/validateToken';

export async function OPTIONS() {
  return handleCors();
}

export async function GET(request, { params }) {
  if (!(await validateBearerToken(request))) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const clientData = await getClientFidelizationData(id);

    if (!clientData) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    return NextResponse.json(clientData, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('Error en endpoint cliente:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}