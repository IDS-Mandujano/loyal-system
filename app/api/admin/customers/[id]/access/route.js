import { NextResponse } from 'next/server';
import { generateCustomerAccessService } from '@/lib/services/customerService';
import { cookies } from 'next/headers';
import { hasPermission } from '@/lib/services/authService';

export async function POST(request, { params }) {
  try {
    const sessionCookie = (await cookies()).get('user_session')?.value;
    if (!sessionCookie) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const session = JSON.parse(sessionCookie);
    if (!(await hasPermission(session.id, 'manage_customers')) && !(await hasPermission(session.id, 'manage_users'))) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }
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