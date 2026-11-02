'use client';

export function RewardsTable({ rewards, loading }) {
  if (loading) return <p>Cargando catálogo...</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
          <th style={{ padding: '10px', border: '1px solid #ddd' }}>Imagen</th>
          <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
          <th style={{ padding: '10px', border: '1px solid #ddd' }}>Puntos</th>
          <th style={{ padding: '10px', border: '1px solid #ddd' }}>Stock</th>
          <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nivel Mín.</th>
        </tr>
      </thead>
      <tbody>
        {rewards.map(r => (
          <tr key={r.id}>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              {r.image_url ? <img src={r.image_url} alt={r.name} width="50" style={{ borderRadius: '4px' }} /> : 'Sin imagen'}
            </td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.name}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.points_required} pts</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.stock}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.min_tier}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}