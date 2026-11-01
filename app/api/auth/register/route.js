import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserPermission, createUser } from '@/lib/services/authService';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Falta sesión.' },
        { status: 401 }
      );
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Sesión inválida.' },
        { status: 401 }
      );
    }

    const hasPermission = await verifyUserPermission(sessionData.roleId, 'manage_users');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. No tienes permisos para registrar usuarios.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role_id } = body;

    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos (name, email, password, role_id) son obligatorios.' },
        { status: 400 }
      );
    }

    const newUser = await createUser({ name, email, password, role_id });

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado con éxito',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.role_id,
        createdAt: newUser.created_at
      }
    }, { status: 201 });

  } catch (err) {
    console.error('❌ Error en el registro de usuario:', err);
    
    if (err.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico ya está registrado.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}