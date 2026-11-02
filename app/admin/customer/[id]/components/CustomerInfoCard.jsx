'use client';

export function CustomerInfoCard({ customer, onGenerateAccess, tempPassword, message }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
      <h2>Información del Cliente #{customer.cliente_id}</h2>
      
      {message && <div style={{ padding: '10px', background: '#e2f0d9', margin: '10px 0', borderRadius: '5px' }}>{message}</div>}

      {tempPassword && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
          <strong>🔑 Contraseña Temporal Generada:</strong> <code style={{ background: '#fff', padding: '4px 8px', fontSize: '16px' }}>{tempPassword}</code>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#856404' }}>Guarda esta contraseña ahora. Por seguridad, no se volverá a mostrar en pantalla.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', margin: '20px 0' }}>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6c757d' }}>Puntos Disponibles</p>
          <h3 style={{ margin: '5px 0 0 0', color: '#0070f3' }}>{customer.puntos_disponibles} / {customer.puntos}</h3>
        </div>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6c757d' }}>Nivel Actual</p>
          <h3 style={{ margin: '5px 0 0 0', color: '#28a745' }}>{customer.nivel}</h3>
        </div>
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#6c757d' }}>Gasto (12m)</p>
          <h3 style={{ margin: '5px 0 0 0' }}>$ {Number(customer.gasto_12m || 0).toLocaleString()} MXN</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={onGenerateAccess} 
          style={{ background: '#ffc107', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔑 Generar / Restablecer Acceso al Portal
        </button>
        {customer.en_riesgo && (
          <span style={{ background: '#dc3545', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '14px' }}>
            ⚠️ Cliente en riesgo ({customer.dias_sin_actividad} días sin actividad)
          </span>
        )}
      </div>
    </div>
  );
}