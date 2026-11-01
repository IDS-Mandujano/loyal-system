import db from '@/lib/db';

export async function getDashboardMetrics() {
  const client = await db.getClient();
  try {
    const tierQuery = await client.query(`
      SELECT level, COUNT(*) as count 
      FROM customers 
      GROUP BY level
    `);

    const top10Query = await client.query(`
      SELECT id, name, email, points, level 
      FROM customers 
      ORDER BY points DESC 
      LIMIT 10
    `);

    const inRiskQuery = await client.query(`
      SELECT id, name, email, level, points 
      FROM customers 
      WHERE is_risk = TRUE OR status = 'risk'
      LIMIT 10
    `);

    const upcomingBirthdaysQuery = await client.query(`
      SELECT id, name, email, birth_date 
      FROM customers 
      WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      ORDER BY EXTRACT(DAY FROM birth_date) ASC
      LIMIT 10
    `);

    return {
      tiers: tierQuery.rows,
      top10: top10Query.rows,
      inRisk: inRiskQuery.rows,
      birthdays: upcomingBirthdaysQuery.rows
    };
  } finally {
    client.release();
  }
}