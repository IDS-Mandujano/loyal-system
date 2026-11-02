import db from '@/lib/db';
import bcrypt from 'bcryptjs';

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

export async function searchCustomers(query) {
  const client = await db.getClient();
  try {
    const searchQuery = await client.query(
      `SELECT id, name, email, points, tier, is_at_risk, dob 
       FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 
       LIMIT 20`,
      [`%${query}%`]
    );
    return searchQuery.rows;
  } finally {
    client.release();
  }
}

export async function generateCustomerAccessService(customerId) {
  const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase() + 'A1!';
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const query = `
    UPDATE users 
    SET portal_password_hash = $1, must_change_password = TRUE, updated_at = NOW() 
    WHERE id = $2 
    RETURNING id, email;
  `;
  
  const result = await db.query(query, [passwordHash, customerId]);

  if (result.rows.length === 0) {
    return { success: false, error: 'Cliente no encontrado' };
  }

  return { success: true, tempPassword };
}