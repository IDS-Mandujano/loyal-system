'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/client/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password })
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || 'No se pudo actualizar');
      else router.push('/client');
    } catch {
      setError('No se pudo actualizar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', color: '#0f172a' }}>
      <section style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #dbeafe', borderRadius: 24, padding: '2.25rem', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)' }}>
        <div style={{ width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 16, background: '#dbeafe', color: '#1d4ed8', fontSize: 24, marginBottom: 20 }}>✓</div>
        <p style={{ margin: 0, color: '#2563eb', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Primer acceso</p>
        <h1 style={{ margin: '0.4rem 0 0.6rem', fontSize: 30 }}>Crea tu contraseña</h1>
        <p style={{ margin: '0 0 1.75rem', color: '#64748b', lineHeight: 1.6 }}>Por seguridad, reemplaza la contraseña temporal antes de entrar al portal.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 7, color: '#334155', fontSize: 14, fontWeight: 600 }}>
            Nueva contraseña
            <span style={{ position: 'relative' }}>
              <input required minLength={6} type={showPassword ? 'text' : 'password'} value={password}
                onChange={event => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres"
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 4.5rem 0.8rem 0.9rem', border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 15 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: 7, padding: '0.45rem 0.55rem', border: 0, background: 'transparent', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }}>
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </span>
          </label>
          {error && <p role="alert" style={{ margin: 0, padding: '0.75rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 14 }}>{error}</p>}
          <button disabled={loading} style={{ padding: '0.85rem 1rem', border: 0, borderRadius: 10, background: loading ? '#94a3b8' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </section>
    </main>
  );
}
