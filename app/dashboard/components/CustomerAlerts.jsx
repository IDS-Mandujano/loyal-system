export default function CustomerAlerts({ inRisk, birthdays }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Clientes en Riesgo */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#dc2626' }}>⚠️ Clientes en Riesgo</h2>
        {inRisk?.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No hay clientes en riesgo en este momento.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
            {inRisk?.map((c) => (
              <li key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.name}</span>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{c.level}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Próximos Cumpleaños */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#2563eb' }}>🎂 Cumpleaños de este Mes</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
          {birthdays?.map((c) => (
            <li key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <span>{c.name}</span>
              <span style={{ color: '#64748b' }}>{new Date(c.birth_date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}