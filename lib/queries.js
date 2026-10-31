export const queries = {
  upsertUser: (client, u) =>
    client.query(
      `
        INSERT INTO users (id, name, email, phone, dob, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            dob = EXCLUDED.dob,
            updated_at = NOW();
        `,
      [u.id, u.name, u.email, u.phone, u.dob, u.created_at],
    ),

  upsertOrder: (client, o) =>
    client.query(
      `
    INSERT INTO orders (id, user_id, status, payment_status, total, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      payment_status = EXCLUDED.payment_status,
      total = EXCLUDED.total;
  `,
      [o.id, o.user.id, o.status, o.payment_status, o.total, o.created_at],
    ),
    
  upsertPayment: (client, p) => client.query(`
    INSERT INTO payments (id, user_id, amount, currency, status, paid_at, created_at, order_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      amount = EXCLUDED.amount,
      paid_at = EXCLUDED.paid_at;
  `, [p.id, p.user.id, p.amount, p.currency, p.status, p.paid_at, p.created_at, p.metadata?.order_id]),

  insertPointMovement: (client, userId, fecha, tipo, referencia, puntos) => client.query(`
    INSERT INTO point_movements (user_id, fecha, tipo, referencia, puntos)
    VALUES ($1, $2, $3, $4, $5)
  `, [userId, fecha, tipo, referencia, puntos]),

  getDeliveredOrders: (client, cutoffDate) => client.query(`
    SELECT id, user_id, created_at FROM orders 
    WHERE status = 'delivered' AND payment_status = 'paid' AND created_at <= $1
  `, [cutoffDate]),

  checkBonusExists: (client, referencia) => client.query(`
    SELECT 1 FROM point_movements WHERE tipo = 'bono_orden_entregada' AND referencia = $1
  `, [referencia]),

  getUsersSummary: (client, cutoffDate) => client.query(`
    SELECT u.id,
      COALESCE(SUM(pm.puntos), 0) as total_points,
      COALESCE(SUM(CASE 
        WHEN p.status = 'succeeded' AND p.paid_at >= $1::timestamp - INTERVAL '12 months' AND p.paid_at <= $1::timestamp 
        THEN p.amount * COALESCE(
          CASE p.currency 
            WHEN 'USD' THEN 18.50 WHEN 'EUR' THEN 20.00 WHEN 'GBP' THEN 23.50 
            WHEN 'CAD' THEN 13.50 WHEN 'AUD' THEN 12.00 WHEN 'MXN' THEN 1.00 ELSE 0 END, 0)
        ELSE 0 END), 0) as spent_12m,
      EXTRACT(DAY FROM ($1::timestamp - MAX(COALESCE(p.paid_at, o.created_at, u.created_at)))) as days_inactive
    FROM users u
    LEFT JOIN point_movements pm ON u.id = pm.user_id
    LEFT JOIN payments p ON u.id = p.user_id
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id
  `, [cutoffDate]),

  updateUserMetrics: (client, points, tier, spent12m, isAtRisk, daysInactive, userId) => client.query(`
    UPDATE users 
    SET points = $1,
        tier = $2,
        total_spent_12m = $3,
        is_at_risk = $4,
        days_without_activity = $5,
        updated_at = NOW()
    WHERE id = $6
  `, [points, tier, spent12m, isAtRisk, daysInactive, userId])
};