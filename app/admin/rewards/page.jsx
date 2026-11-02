'use client';

import { useRewards } from './useRewards';
import { RewardForm } from './components/RewardForm';
import { RewardsTable } from './components/RewardsTable';
import AdminNav from '../components/AdminNav';

export default function AdminRewardsPage() {
  const {
    rewards,
    loading,
    form,
    message,
    handleInputChange,
    handleFileChange,
    createReward
  } = useRewards();

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <AdminNav active="/admin/rewards" />
      <h1>Gestión de Recompensas y Catálogo</h1>
      <p>Administra los productos o descuentos canjeables y sube sus imágenes a Supabase Storage.</p>

      {message && <div style={{ padding: '10px', background: '#e2f0d9', marginBottom: '20px', borderRadius: '5px' }}>{message}</div>}

      <RewardForm 
        form={form} 
        onInputChange={handleInputChange} 
        onFileChange={handleFileChange} 
        onSubmit={createReward} 
      />

      <h2>Catálogo Actual</h2>
      <RewardsTable rewards={rewards} loading={loading} />
    </div>
  );
}