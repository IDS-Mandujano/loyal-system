'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientPortalPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch('/api/client/me');
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || 'Sesión inválida');
      return;
    }
    if (result.user.must_change_password) {
      router.push('/client/change-password');
      return;
    }
    setData(result);
  }

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, []);

  async function redeem(rewardId) {
    const response = await fetch('/api/client/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId })
    });
    const result = await response.json();
    setMessage(result.success ? 'Canje registrado correctamente.' : result.error);
    if (result.success) load();
  }

  if (error) return <main style={{ padding: 24 }}><p>{error}</p><a href="/client/login">Iniciar sesión</a></main>;
  if (!data) return <main style={{ padding: 24 }}>Cargando portal...</main>;
  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>Hola, {data.user.name}</h1>
      <p>Puntos disponibles: <strong>{data.user.points}</strong> · Nivel: <strong>{data.user.tier}</strong></p>
      {message && <p>{message}</p>}
      <h2>Recompensas</h2>
      <section style={{ display: 'grid', gap: 12 }}>
        {data.rewards.map(reward => (
          <article key={reward.id} style={{ border: '1px solid #ddd', padding: 12 }}>
            <strong>{reward.name}</strong> — {reward.points_required} puntos
            <button onClick={() => redeem(reward.id)} style={{ marginLeft: 12 }}>Canjear</button>
          </article>
        ))}
      </section>
      <h2>Movimientos</h2>
      <ul>{data.movements.map((movement, index) => <li key={`${movement.referencia}-${index}`}>{movement.fecha}: {movement.tipo} ({movement.puntos})</li>)}</ul>
      <h2>Mis canjes</h2>
      <ul>{data.redemptions.map(redemption => <li key={redemption.id}>{redemption.reward_name}: {redemption.status} {redemption.coupon_code || ''}</li>)}</ul>
    </main>
  );
}
