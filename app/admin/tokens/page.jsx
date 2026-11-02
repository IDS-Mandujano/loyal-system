'use client';

import { useEffect, useState } from 'react';
import AdminNav from '../components/AdminNav';

export default function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [name, setName] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadTokens() {
    setLoading(true);
    const response = await fetch('/api/tokens');
    const data = await response.json();
    if (response.ok) setTokens(data.tokens);
    else setMessage(data.error || 'No se pudieron cargar los tokens.');
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(loadTokens, 0);
    return () => clearTimeout(timer);
  }, []);

  async function createToken(event) {
    event.preventDefault();
    setMessage('');
    setGeneratedToken('');
    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'No se pudo generar el token.');
      return;
    }
    setGeneratedToken(data.token);
    setName('');
    setMessage('Token generado. Cópialo ahora; no volverá a mostrarse.');
    loadTokens();
  }

  async function revokeToken(id) {
    const response = await fetch(`/api/tokens/${id}`, { method: 'DELETE' });
    const data = await response.json();
    setMessage(data.message || data.error || 'Operación completada.');
    if (response.ok) loadTokens();
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <AdminNav active="/admin/tokens" />
        <header style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, color: '#2563eb', fontWeight: 700 }}>Panel interno</p>
          <h1 style={{ margin: '0.35rem 0' }}>Tokens de API</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Genera credenciales para consumir los endpoints de fidelización.</p>
        </header>
        {message && <p role="status" style={{ padding: '0.85rem 1rem', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10 }}>{message}</p>}
        {generatedToken && <div style={{ padding: '1rem', marginBottom: '1.5rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12 }}>
          <strong>Token generado (guárdalo ahora)</strong>
          <code style={{ display: 'block', marginTop: 8, padding: 10, overflowX: 'auto', background: '#fff', borderRadius: 8 }}>{generatedToken}</code>
        </div>}
        <section style={{ background: '#fff', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 16, marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0 }}>Generar token</h2>
          <form onSubmit={createToken} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input required value={name} onChange={event => setName(event.target.value)} placeholder="Descripción, por ejemplo: Evaluación técnica" style={{ flex: '1 1 280px', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 9 }} />
            <button style={{ padding: '0.75rem 1rem', border: 0, borderRadius: 9, background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Generar token</button>
          </form>
        </section>
        <section style={{ background: '#fff', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 16 }}>
          <h2 style={{ marginTop: 0 }}>Tokens registrados</h2>
          {loading ? <p style={{ color: '#64748b' }}>Cargando...</p> : tokens.length === 0 ? <p style={{ color: '#64748b' }}>No hay tokens registrados.</p> : <div style={{ display: 'grid', gap: 10 }}>{tokens.map(token => <article key={token.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '1rem', background: '#f8fafc', borderRadius: 10 }}><span><strong>{token.name}</strong><small style={{ display: 'block', color: '#64748b' }}>Creado: {new Date(token.created_at).toLocaleString('es-MX')} · {token.is_active ? 'Activo' : 'Revocado'}</small></span>{token.is_active && <button type="button" onClick={() => revokeToken(token.id)} style={{ padding: '0.55rem 0.75rem', border: '1px solid #fecaca', borderRadius: 8, background: '#fff', color: '#b91c1c', fontWeight: 700, cursor: 'pointer' }}>Revocar</button>}</article>)}</div>}
        </section>
      </div>
    </main>
  );
}
