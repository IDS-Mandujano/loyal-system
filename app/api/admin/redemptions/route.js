import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { hasPermission } from '@/lib/services/authService';

async function authorized() {
  const value = (await cookies()).get('user_session')?.value;
  if (!value) return false;
  try {
    const session = JSON.parse(value);
    return (await hasPermission(session.id, 'manage_rewards')) || (await hasPermission(session.id, 'manage_users'));
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  const result = await db.query(`
    SELECT r.id, r.user_id, u.name AS customer_name, rw.name AS reward_name,
      r.points_spent, r.status, r.coupon_code, r.expires_at, r.created_at
    FROM redemptions r JOIN users u ON u.id = r.user_id JOIN rewards rw ON rw.id = r.reward_id
    ORDER BY r.created_at DESC
  `);
  return NextResponse.json({ redemptions: result.rows });
}

export async function PATCH(request) {
  if (!(await authorized())) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  const { id, status } = await request.json();
  if (!id || !['entregado', 'cancelado', 'usado', 'vigente'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT * FROM redemptions WHERE id = $1 FOR UPDATE', [id]);
    if (!current.rowCount) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Canje no encontrado' }, { status: 404 });
    }
    const redemption = current.rows[0];
    if (redemption.status === 'cancelado') return NextResponse.json({ error: 'El canje ya está cancelado' }, { status: 400 });
    if (status === 'cancelado' && redemption.status !== 'cancelado') {
      await client.query('UPDATE users SET points = points + $1 WHERE id = $2', [redemption.points_spent, redemption.user_id]);
      await client.query('UPDATE rewards SET stock = stock + 1 WHERE id = $1 AND stock IS NOT NULL', [redemption.reward_id]);
      await client.query(
        `INSERT INTO point_movements (user_id, fecha, tipo, referencia, puntos) VALUES ($1, CURRENT_DATE, 'devolucion', $2, $3)`,
        [redemption.user_id, `devolucion:${id}`, redemption.points_spent]
      );
    }
    const updated = await client.query('UPDATE redemptions SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    await client.query('COMMIT');
    return NextResponse.json({ redemption: updated.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error actualizando canje:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el canje' }, { status: 400 });
  } finally {
    client.release();
  }
}
