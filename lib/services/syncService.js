export const queries = {
  upsertUsersBatch: (client, users) => {
    const values = [];
    const placeholders = users.map((u, index) => {
      const offset = index * 6;
      values.push(u.id, u.name, u.email, u.phone, u.dob, u.created_at);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, NOW())`;
    }).join(',');

    return client.query(`
      INSERT INTO users (id, name, email, phone, dob, created_at, updated_at)
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          dob = EXCLUDED.dob,
          updated_at = NOW();
    `, values);
  },

  upsertOrdersBatch: (client, orders) => {
    const values = [];
    const placeholders = orders.map((o, index) => {
      const offset = index * 6;
      values.push(o.id, o.user.id, o.status, o.payment_status, o.total, o.created_at);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
    }).join(',');

    return client.query(`
      INSERT INTO orders (id, user_id, status, payment_status, total, created_at)
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        payment_status = EXCLUDED.payment_status,
        total = EXCLUDED.total;
    `, values);
  },

  upsertPaymentsBatch: (client, payments) => {
    const values = [];
    const placeholders = payments.map((p, index) => {
      const offset = index * 8;
      values.push(p.id, p.user.id, p.amount, p.currency, p.status, p.paid_at, p.created_at, p.metadata?.order_id || null);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
    }).join(',');

    return client.query(`
      INSERT INTO payments (id, user_id, amount, currency, status, paid_at, created_at, order_id)
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        amount = EXCLUDED.amount,
        paid_at = EXCLUDED.paid_at;
    `, values);
  },

  insertPointMovementsBatch: (client, movements) => {
    const values = [];
    const placeholders = movements.map((m, index) => {
      const offset = index * 5;
      values.push(m[0], m[1], m[2], m[3], m[4]);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(',');

    return client.query(`
      INSERT INTO point_movements (user_id, fecha, tipo, referencia, puntos)
      VALUES ${placeholders}
    `, values);
  },

  getDeliveredOrders: (client, cutoffDate) => client.query(`
    SELECT id, user_id, created_at FROM orders 
    WHERE status = 'delivered' AND payment_status = 'paid' AND created_at <= $1
  `, [cutoffDate]),

  checkBonusExists: (client, referencia) => client.query(`
    SELECT 1 FROM point_movements WHERE tipo = 'bono_orden_entregada' AND referencia = $1
  `, [referencia]),

  updateAllUserMetrics: (client, cutoffDate) => client.query(`
    UPDATE users u
    SET 
        points = sub.available_points,
        tier = CASE 
            WHEN sub.spent_12m > 400000 THEN 'Oro'
            WHEN sub.spent_12m >= 150000 THEN 'Plata'
            ELSE 'Bronce'
        END,
        total_spent_12m = sub.spent_12m,
        is_at_risk = (sub.has_successful_payment AND sub.days_inactive >= 90),
        days_without_activity = sub.days_inactive,
        updated_at = NOW()
    FROM (
        SELECT u.id,
            COALESCE((SELECT SUM(pm.puntos) FROM point_movements pm WHERE pm.user_id = u.id), 0) as available_points,
            COALESCE((SELECT SUM(pm.puntos) FROM point_movements pm
                      WHERE pm.user_id = u.id
                        AND pm.tipo IN ('pago', 'reembolso', 'bono_orden_entregada')), 0) as earned_points,
            COALESCE((SELECT SUM(CASE
                WHEN p.status = 'succeeded'
                  AND COALESCE(p.paid_at, p.created_at) >= $1::timestamp - INTERVAL '12 months'
                  AND COALESCE(p.paid_at, p.created_at) <= $1::timestamp
                THEN p.amount * COALESCE(
                    CASE p.currency 
                        WHEN 'USD' THEN 18.50 WHEN 'EUR' THEN 20.00 WHEN 'GBP' THEN 23.50 
                        WHEN 'CAD' THEN 13.50 WHEN 'AUD' THEN 12.00 WHEN 'MXN' THEN 1.00 ELSE 0 END, 0)
                ELSE 0 END) FROM payments p WHERE p.user_id = u.id), 0) as spent_12m,
            EXTRACT(DAY FROM ($1::timestamp - GREATEST(
              COALESCE((SELECT MAX(COALESCE(p.paid_at, p.created_at)) FROM payments p WHERE p.user_id = u.id AND p.status = 'succeeded'), '1900-01-01'::timestamp),
              COALESCE((SELECT MAX(o.created_at) FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled'), '1900-01-01'::timestamp)
            ))) as days_inactive,
            EXISTS (SELECT 1 FROM payments p WHERE p.user_id = u.id AND p.status = 'succeeded') as has_successful_payment
        FROM users u
        GROUP BY u.id
    ) sub
    WHERE u.id = sub.id;
  `, [cutoffDate])
};