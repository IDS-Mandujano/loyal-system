import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    // Validar que la petición provenga de Vercel Cron con el token secreto correcto
    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Aquí puedes colocar la lógica de sincronización de tu base de datos o llamada a servicio
    // Ejemplo: const syncResult = await runFullSync();
    const syncResult = { status: 'Sincronización completada exitosamente' };

    return NextResponse.json({
      success: true,
      message: 'Sincronización diaria ejecutada correctamente',
      result: syncResult,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Error en Vercel Cron sync:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}