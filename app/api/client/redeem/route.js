import { NextResponse } from 'next/server';
import { redeemReward } from '@/lib/services/redemptionService';
import { getAuthenticatedClientId } from '@/lib/services/clientSession';

export async function POST(request) {
  try {
    const clientId = await getAuthenticatedClientId(request);
    const { rewardId } = await request.json();

    if (!clientId || !rewardId) {
      return NextResponse.json(
        { success: false, error: clientId ? 'rewardId es requerido' : 'Sesión de cliente requerida' },
        { status: clientId ? 400 : 401 }
      );
    }

    const result = await redeemReward(clientId, rewardId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error en /api/client/redeem:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar el canje' },
      { status: 400 }
    );
  }
}