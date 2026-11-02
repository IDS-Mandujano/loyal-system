import { NextResponse } from 'next/server';
import { redeemReward } from '@/lib/services/redemptionService';

export async function POST(request) {
  try {
    const { clientId, rewardId } = await request.json();

    if (!clientId || !rewardId) {
      return NextResponse.json(
        { success: false, error: 'clientId y rewardId son requeridos' },
        { status: 400 }
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