export default function HeaderSync({ onSync, syncing, syncMessage }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Panel Interno de Lealtad</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Resumen general de clientes, niveles y actividades</p>
      </div>
      
      <div>
        <button
          onClick={onSync}
          disabled={syncing}
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: syncing ? '#94a3b8' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: syncing ? 'not-allowed' : 'pointer'
          }}
        >
          {syncing ? 'Sincronizando...' : '🔄 Sincronización Manual'}
        </button>
        {syncMessage && (
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: syncMessage.includes('❌') ? '#ef4444' : '#16a34a' }}>
            {syncMessage}
          </p>
        )}
      </div>
    </div>
  );
}