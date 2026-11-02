import db from '@/lib/db';

export async function getClientFidelizationData(clientId) {
  const client = await db.getClient();
  try {
    const userQuery = await client.query(
      `SELECT id, name, email, points, tier, total_spent_12m, is_at_risk, days_without_activity, dob 
       FROM users WHERE id = $1`,
      [clientId]
    );

    if (userQuery.rows.length === 0) {
      return null;
    }

    const user = userQuery.rows[0];

    const movQuery = await client.query(
      `SELECT fecha, tipo, referencia, puntos 
       FROM point_movements 
       WHERE user_id = $1 
       ORDER BY fecha ASC`,
      [clientId]
    );

    return {
      cliente_id: user.id,
      puntos: user.points || 0,
      puntos_disponibles: user.points || 0,
      nivel: user.tier || 'Bronce',
      gasto_12m: parseFloat(user.total_spent_12m || 0),
      en_riesgo: user.is_at_risk || false,
      dias_sin_actividad: user.days_without_activity !== null ? user.days_without_activity : null,
      movimientos: movQuery.rows.map(m => ({
        fecha: m.fecha,
        tipo: m.tipo,
        referencia: m.referencia,
        puntos: m.puntos
      }))
    };
  } finally {
    client.release();
  }
}

export async function getRiskClientsData() {
  const client = await db.getClient();
  try {
    const result = await client.query(`
      SELECT id as cliente_id, days_without_activity as dias_sin_actividad
      FROM users
      WHERE is_at_risk = TRUE
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getUpcomingBirthdaysData() {
  const client = await db.getClient();
  try {
    const result = await client.query(
      `SELECT id as cliente_id, dob as fecha_cumpleanos 
       FROM users 
       WHERE dob IS NOT NULL`
    );
    return result.rows.map(r => ({
      cliente_id: r.cliente_id,
      fecha_cumpleanos: r.fecha_cumpleanos
    }));
  } finally {
    client.release();
  }
}