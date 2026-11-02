import db from '@/lib/db';

export async function getClientPortalData(clientId) {
  const client = await db.getClient();
  try {
    const user = await client.query(
      `SELECT id, name, email, points, tier, must_change_password
       FROM users WHERE id = $1`,
      [clientId]
    );
    if (user.rowCount === 0) return null;

    const movements = await client.query(
      `SELECT fecha, tipo, referencia, puntos
       FROM point_movements WHERE user_id = $1 ORDER BY fecha DESC, id DESC`,
      [clientId]
    );
    const redemptions = await client.query(
      `SELECT r.id, r.points_spent, r.status, r.coupon_code, r.expires_at,
              rw.name AS reward_name
       FROM redemptions r JOIN rewards rw ON rw.id = r.reward_id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [clientId]
    );
    return {
      user: user.rows[0],
      movements: movements.rows,
      redemptions: redemptions.rows
    };
  } finally {
    client.release();
  }
}
