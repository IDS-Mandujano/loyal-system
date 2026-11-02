import { NextResponse } from 'next/server';
import { updateClientPassword } from '@/lib/services/clientAuthService';
import { getAuthenticatedClientId } from '@/lib/services/clientSession';

export async function POST(request) {
  try {
    const clientId = await getAuthenticatedClientId(request);
    const { newPassword } = await request.json();

    if (!clientId || !newPassword) {
      return NextResponse.json(
        { success: false, error: clientId ? 'Nueva contraseña requerida' : 'Sesión de cliente requerida' },
        { status: clientId ? 400 : 401 }
      );
    }

    const updatedUser = await updateClientPassword(clientId, newPassword);

    return NextResponse.json(
      {
        success: true,
        message: 'Contraseña actualizada con éxito',
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en /api/client/change-password:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar la contraseña' },
      { status: 400 }
    );
  }
}