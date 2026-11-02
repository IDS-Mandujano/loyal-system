import Link from 'next/link';

export default function TopCustomersTable({ top10 }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>🏆 Top 10 Clientes por Puntos</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Numero #</th>
            <th style={{ padding: '0.5rem' }}>Cliente</th>
            <th style={{ padding: '0.5rem' }}>Nivel</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {top10?.map((c, index) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.5rem' }}>
                <Link 
                  href={`/admin/customer/${c.id}`}
                  style={{ color: '#0070f3', textDecoration: 'none', fontWeight: '500' }}
                >
                  #{index + 1}
                </Link>
              </td>
              <td style={{ padding: '0.5rem' }}>
                <Link 
                  href={`/admin/customer/${c.id}`}
                  style={{ color: '#0070f3', textDecoration: 'none', fontWeight: '500' }}
                >
                  {c.name}
                </Link>
              </td>
              <td style={{ padding: '0.5rem' }}>{c.tier}</td>
              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>{c.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}