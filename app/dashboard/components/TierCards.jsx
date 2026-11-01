export default function TierCards({ tiers }) {
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Clientes por Nivel</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {tiers?.map((tier) => (
          <div key={tier.level} style={{ padding: '1.25rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>{tier.level}</span>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.5rem' }}>{tier.count}</div>
          </div>
        ))}
      </div>
    </>
  );
}