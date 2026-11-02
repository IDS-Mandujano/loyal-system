'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo iniciar sesión');
      router.push(data.user.must_change_password ? '/client/change-password' : '/client');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '5rem auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>Portal del cliente</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input required type="email" placeholder="Correo" value={form.email}
          onChange={event => setForm({ ...form, email: event.target.value })} />
        <input required type="password" placeholder="Contraseña" value={form.password}
          onChange={event => setForm({ ...form, password: event.target.value })} />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
    </main>
  );
}
