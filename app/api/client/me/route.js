import { NextResponse } from 'next/server';
import { getAuthenticatedClientId } from '@/lib/services/clientSession';
import { getClientPortalData } from '@/lib/services/clientPortalService';
import { getAllRewards } from '@/lib/services/rewardService';

export async function GET(request) {
  const clientId = await getAuthenticatedClientId(request);
  if (!clientId) return NextResponse.json({ success: false, error: 'Sesión requerida' }, { status: 401 });
  try {
    const [portal, rewards] = await Promise.all([
      getClientPortalData(clientId),
      getAllRewards(false)
    ]);
    if (!portal) return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, ...portal, rewards });
  } catch (error) {
    console.error('Error cargando portal del cliente:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
