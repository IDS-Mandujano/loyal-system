import { NextResponse } from 'next/server';
import { generateCustomerAccessService } from '@/lib/services/customerService';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const result = await generateCustomerAccessService(id);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      tempPassword: result.tempPassword, 
      message: 'Acceso generado correctamente' 
    });
  } catch (error) {
    console.error('Error en endpoint de acceso:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}