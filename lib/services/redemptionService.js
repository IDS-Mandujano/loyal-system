import db from '@/lib/db';
import crypto from 'crypto';

function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(8);
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) part1 += chars[bytes[i] % chars.length];
  for (let i = 4; i < 8; i++) part2 += chars[bytes[i] % chars.length];
  return `LEAL-${part1}-${part2}`;
}

export async function redeemReward(clientId, rewardId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const userRes = await client.query(
      `SELECT id, points, tier FROM users WHERE id = $1 FOR UPDATE`,
      [clientId]
    );
    if (userRes.rowCount === 0) {
      throw new Error('Cliente no encontrado.');
    }
    const user = userRes.rows[0];

    const rewardRes = await client.query(
      `SELECT id, type, name, points_required, stock, min_tier, max_redemptions_per_client, is_active, validity_days 
       FROM rewards WHERE id = $1 FOR UPDATE`,
      [rewardId]
    );
    if (rewardRes.rowCount === 0) {
      throw new Error('La recompensa no existe.');
    }
    const reward = rewardRes.rows[0];

    if (!reward.is_active) {
      throw new Error('La recompensa no está activa.');
    }

    if (reward.stock !== null && reward.stock <= 0) {
      throw new Error('Lo sentimos, la recompensa se encuentra agotada.');
    }

    if (user.points < reward.points_required) {
      throw new Error(`Puntos insuficientes. Tienes ${user.points} puntos y se requieren ${reward.points_required}.`);
    }

    const tierWeights = { 'Bronce': 1, 'Plata': 2, 'Oro': 3 };
    const userWeight = tierWeights[user.tier] || 1;
    const minWeight = tierWeights[reward.min_tier] || 1;
    if (userWeight < minWeight) {
      throw new Error(`Nivel insuficiente. Se requiere nivel ${reward.min_tier} o superior.`);
    }

    if (reward.max_redemptions_per_client) {
      const redCountRes = await client.query(
        `SELECT COUNT(*) FROM redemptions WHERE user_id = $1 AND reward_id = $2 AND status != 'cancelado'`,
        [clientId, rewardId]
      );
      const currentRedemptions = parseInt(redCountRes.rows[0].count);
      if (currentRedemptions >= reward.max_redemptions_per_client) {
        throw new Error('Has alcanzado el límite máximo de canjes permitidos para esta recompensa.');
      }
    }

    const newPoints = user.points - reward.points_required;
    await client.query(`UPDATE users SET points = $1, updated_at = NOW() WHERE id = $2`, [newPoints, clientId]);

if (reward.stock !== null) {
      await client.query(`UPDATE rewards SET stock = stock - 1 WHERE id = $1`, [rewardId]);
    }

    let couponCode = null;
    let expiresAt = null;
    let initialStatus = 'pendiente';

    if (reward.type === 'descuento') {
      couponCode = generateCouponCode();
      initialStatus = 'vigente';
      if (reward.validity_days) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + reward.validity_days);
      }
    }

    const redemptionRes = await client.query(
      `INSERT INTO redemptions (user_id, reward_id, points_spent, status, coupon_code, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, coupon_code, status, expires_at, created_at`,
      [clientId, rewardId, reward.points_required, initialStatus, couponCode, expiresAt]
    );

    const movementRef = `canje:${redemptionRes.rows[0].id}`;
    await client.query(
      `INSERT INTO point_movements (user_id, fecha, tipo, referencia, puntos)
       VALUES ($1, CURRENT_DATE, 'canje', $2, $3)`,
      [clientId, movementRef, -reward.points_required]
    );

    await client.query('COMMIT');

    return {
      success: true,
      redemption: redemptionRes.rows[0],
      remaining_points: newPoints
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}