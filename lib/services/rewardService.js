import db from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las credenciales privadas de Supabase Storage');
}
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getAllRewards(includeInactive = false) {
  let query = 'SELECT * FROM rewards';
  if (!includeInactive) {
    query += ' WHERE is_active = TRUE';
  }
  query += ' ORDER BY created_at DESC';
  const result = await db.query(query);
  return result.rows;
}

export async function createReward(data, imageFile = null) {
  let imageUrl = data.image_url || null;

  if (imageFile) {
    const fileName = `reward-${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('rewards-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('rewards-images')
      .getPublicUrl(fileName);
      
    imageUrl = publicUrlData.publicUrl;
  }

  const query = `
    INSERT INTO rewards (
      type, name, description, points_required, stock, min_tier, 
      max_redemptions_per_client, is_active, validity_days, image_url, discount_type, discount_value, min_purchase_amount
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;

  const values = [
    data.type || 'producto',
    data.name,
    data.description,
    data.points_required,
    data.stock !== undefined && data.stock !== '' ? data.stock : null,
    data.min_tier || 'Bronce',
    data.max_redemptions_per_client || null,
    data.is_active !== undefined ? data.is_active : true,
    data.validity_days || null,
    imageUrl,
    data.discount_type || null,
    data.discount_value || null,
    data.min_purchase_amount || data.min_purchase || null
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}