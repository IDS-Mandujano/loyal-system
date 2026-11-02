export default function CustomerSearch({
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchResults,
  selectedCustomer,
  setSelectedCustomer
}) {
  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Búsqueda de Clientes</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Buscar
        </button>
      </form>

      {searchResults?.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {searchResults.map((c) => (
            <li 
              key={c.id} 
              onClick={() => setSelectedCustomer(c)}
              style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <span><strong>{c.name}</strong> ({c.email})</span>
              <span>Nivel: <strong>{c.tier}</strong> | Puntos: <strong>{c.points}</strong></span>
            </li>
          ))}
        </ul>
      )}

      {selectedCustomer && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.375rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Detalle de {selectedCustomer.name}</h3>
          <p style={{ margin: '0.25rem 0' }}>Email: {selectedCustomer.email}</p>
          <p style={{ margin: '0.25rem 0' }}>Nivel Actual: <strong>{selectedCustomer.tier || 'Bronce'}</strong></p>
          <p style={{ margin: '0.25rem 0' }}>Puntos Acumulados: <strong>{selectedCustomer.points}</strong></p>
        </div>
      )}
    </div>
  );
}