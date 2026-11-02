'use client';

export function RewardsTable({ rewards, loading }) {
  if (loading) return <p style={{ color: '#64748b' }}>Cargando catálogo...</p>;
  if (!rewards.length) return <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, color: '#64748b' }}>Aún no hay recompensas publicadas.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: 18 }}>
      {rewards.map(reward => (
        <article key={reward.id} style={{ overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ height: 150, display: 'grid', placeItems: 'center', background: '#eff6ff' }}>
            {reward.image_url ? <img src={reward.image_url} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#60a5fa', fontSize: 13 }}>Sin imagen</span>}
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
              <h3 style={{ margin: 0, fontSize: 17 }}>{reward.name}</h3>
              <span style={{ padding: '0.3rem 0.5rem', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8', fontSize: 11, fontWeight: 800 }}>{reward.min_tier}</span>
            </div>
            <p style={{ minHeight: 38, margin: '0.65rem 0', color: '#64748b', fontSize: 13, lineHeight: 1.45 }}>{reward.description || 'Beneficio exclusivo del programa de lealtad.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <span><strong style={{ display: 'block', color: '#2563eb', fontSize: 20 }}>{Number(reward.points_required).toLocaleString('es-MX')}</strong><small style={{ color: '#64748b' }}>puntos</small></span>
              <span style={{ textAlign: 'right' }}><strong style={{ display: 'block', color: reward.stock > 0 ? '#15803d' : '#b91c1c' }}>{reward.stock ?? '∞'}</strong><small style={{ color: '#64748b' }}>en stock</small></span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
