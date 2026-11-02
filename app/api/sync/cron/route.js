import { NextResponse } from 'next/server';
import { runFullSync } from '../syncLogic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const syncResult = await runFullSync();

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