import { NextResponse } from 'next/server';
import { getAllRewards, createReward } from '@/lib/services/rewardService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const rewards = await getAllRewards(includeInactive);
    return NextResponse.json({ success: true, rewards }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener recompensas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const data = {
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      points_required: parseInt(formData.get('points_required'), 10),
      stock: formData.get('stock') ? parseInt(formData.get('stock'), 10) : null,
      min_tier: formData.get('min_tier'),
      max_redemptions_per_client: formData.get('max_redemptions_per_client') ? parseInt(formData.get('max_redemptions_per_client'), 10) : null,
      is_active: formData.get('is_active') === 'true',
      validity_days: formData.get('validity_days') ? parseInt(formData.get('validity_days'), 10) : null,
      discount_type: formData.get('discount_type'),
      discount_value: formData.get('discount_value') ? parseFloat(formData.get('discount_value')) : null,
    };

    const imageFile = formData.get('image');
    const newReward = await createReward(data, imageFile);

    return NextResponse.json({ success: true, reward: newReward }, { status: 201 });
  } catch (error) {
    console.error('Error al crear recompensa:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}