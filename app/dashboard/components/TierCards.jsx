export default function TierCards({ tiers }) {
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#334155' }}>
        Clientes por Nivel
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {tiers?.map((t) => (
          <div 
            key={t.tier} 
            style={{ padding: '1.25rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}
          >
            <div style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>
              {t.tier ? `Nivel ${t.tier}` : 'Sin Nivel'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.5rem' }}>
              {t.count}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}