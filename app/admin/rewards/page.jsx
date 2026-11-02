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
    createReward,
    imageFile
  } = useRewards();

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1.25rem 4rem', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #ecfeff 100%)', color: '#0f172a' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <AdminNav active="/admin/rewards" />
      <p style={{ margin: 0, color: '#2563eb', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Panel interno</p>
      <h1 style={{ margin: '0.35rem 0', fontSize: 32 }}>Recompensas y catálogo</h1>
      <p style={{ color: '#64748b', marginBottom: '1.75rem', maxWidth: 680 }}>Crea beneficios atractivos, controla su disponibilidad y publica descuentos para tus clientes.</p>

      {message && <div style={{ padding: '10px', background: '#e2f0d9', marginBottom: '20px', borderRadius: '5px' }}>{message}</div>}

      <RewardForm 
        form={form} 
        onInputChange={handleInputChange} 
        onFileChange={handleFileChange} 
        onSubmit={createReward}
        imageFile={imageFile}
      />

      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16, marginTop: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div><p style={{ margin: 0, color: '#2563eb', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Inventario</p><h2 style={{ margin: '0.3rem 0 0' }}>Catálogo actual</h2></div>
        <span style={{ color: '#64748b', fontSize: 14 }}>Recompensas disponibles para canje</span>
      </div>
      <RewardsTable rewards={rewards} loading={loading} />
      </div>
    </main>
  );
}