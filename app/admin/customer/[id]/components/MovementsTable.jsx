'use client';

export function MovementsTable({ movimientos = [] }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3>Historial de Movimientos de Puntos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Fecha</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tipo</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Referencia</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>No hay movimientos registrados.</td>
            </tr>
          ) : (
            movimientos.map((m, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{m.fecha}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{m.tipo}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{m.referencia}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: m.puntos >= 0 ? '#28a745' : '#dc3545' }}>
                  {m.puntos > 0 ? `+${m.puntos}` : m.puntos}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}