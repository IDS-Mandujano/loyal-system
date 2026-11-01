import db from '@/lib/db';

export async function getDashboardMetrics() {
  const client = await db.getClient();
  try {
    const tierQuery = await client.query(`
      SELECT tier, COUNT(*) as count 
      FROM users 
      GROUP BY tier
    `);

    const top10Query = await client.query(`
      SELECT id, name, email, points, tier 
      FROM users 
      ORDER BY points DESC 
      LIMIT 10
    `);

    const inRiskQuery = await client.query(`
      SELECT id, name, email, tier, points 
      FROM users 
      WHERE is_at_risk = TRUE 
      LIMIT 10
    `);

    const upcomingBirthdaysQuery = await client.query(`
      SELECT id, name, email, dob 
      FROM users 
      WHERE dob IS NOT NULL 
        AND EXTRACT(MONTH FROM dob::date) = EXTRACT(MONTH FROM CURRENT_DATE)
      ORDER BY EXTRACT(DAY FROM dob::date) ASC
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