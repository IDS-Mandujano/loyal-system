'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const response = await fetch('/api/client/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: password })
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || 'No se pudo actualizar');
    else router.push('/client');
  }

  return (
    <main style={{ maxWidth: 420, margin: '5rem auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>Cambia tu contraseña</h1>
      <p>Debes crear una contraseña propia antes de continuar.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input required minLength={6} type="password" value={password}
          onChange={event => setPassword(event.target.value)} placeholder="Nueva contraseña" />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button>Guardar contraseña</button>
      </form>
    </main>
  );
}
