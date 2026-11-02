import { NextResponse } from 'next/server';
import { authenticateClient } from '@/lib/services/clientAuthService';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña requeridos' },
        { status: 400 }
      );
    }

    const client = await authenticateClient(email, password);

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (client.error) {
      return NextResponse.json(
        { success: false, error: client.error },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: client.id,
          name: client.name,
          email: client.email,
          must_change_password: client.must_change_password,
          points: client.points,
          tier: client.tier
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en /api/client/login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}