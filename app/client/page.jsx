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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/client/login');
    router.refresh();
  }

  if (error) return <main style={{ padding: 24 }}><p>{error}</p><a href="/client/login">Iniciar sesión</a></main>;
  if (!data) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b', background: '#f8fafc' }}>Cargando tu portal...</main>;
  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1.25rem 4rem', fontFamily: 'system-ui, sans-serif', background: '#f8fafc', color: '#0f172a' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div>
            <p style={{ margin: 0, color: '#2563eb', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mi portal</p>
            <h1 style={{ margin: '0.35rem 0', fontSize: 32 }}>Hola, {data.user.name}</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Aquí tienes tus beneficios y actividad reciente.</p>
          </div>
          <button type="button" onClick={logout} style={{ color: '#475569', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 9, padding: '0.55rem 0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cerrar sesión</button>
        </header>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: '2rem' }}>
          <Metric label="Puntos disponibles" value={data.user.points.toLocaleString('es-MX')} accent="#2563eb" />
          <Metric label="Nivel actual" value={data.user.tier} accent="#7c3aed" />
          <Metric label="Recompensas activas" value={data.rewards.length} accent="#059669" />
        </section>
        {message && <p role="status" style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', color: '#166534', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10 }}>{message}</p>}
        <section style={{ background: '#fff', padding: '1.5rem', borderRadius: 18, border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0 }}>Recompensas para ti</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {data.rewards.map(reward => (
          <article key={reward.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: 14, background: '#f8fafc' }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>{reward.name}</strong>
            <p style={{ margin: '0 0 1rem', color: '#64748b' }}>{reward.points_required.toLocaleString('es-MX')} puntos</p>
            <button onClick={() => redeem(reward.id)} style={{ width: '100%', padding: '0.7rem', border: 0, borderRadius: 9, background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Canjear recompensa</button>
          </article>
        ))}
          </div>
        </section>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <Panel title="Movimientos recientes">
            {data.movements.length === 0 ? <Empty text="Aún no tienes movimientos." /> : <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 10 }}>{data.movements.map((movement, index) => <li key={`${movement.referencia}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}><span><strong style={{ display: 'block', fontSize: 14 }}>{movement.tipo}</strong><small style={{ color: '#94a3b8' }}>{movement.fecha}</small></span><strong style={{ color: movement.puntos >= 0 ? '#059669' : '#dc2626' }}>{movement.puntos > 0 ? '+' : ''}{movement.puntos}</strong></li>)}</ul>}
          </Panel>
          <Panel title="Mis canjes">
            {data.redemptions.length === 0 ? <Empty text="Todavía no has realizado canjes." /> : <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 10 }}>{data.redemptions.map(redemption => <li key={redemption.id} style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}><strong style={{ display: 'block' }}>{redemption.reward_name}</strong><small style={{ color: '#64748b' }}>{redemption.status} {redemption.coupon_code ? `· Cupón: ${redemption.coupon_code}` : ''}</small></li>)}</ul>}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, accent }) {
  return <article style={{ background: '#fff', padding: '1.25rem', borderRadius: 16, border: '1px solid #e2e8f0', borderLeft: `4px solid ${accent}` }}><small style={{ color: '#64748b', fontWeight: 600 }}>{label}</small><strong style={{ display: 'block', marginTop: 8, fontSize: 26 }}>{value}</strong></article>;
}

function Panel({ title, children }) {
  return <section style={{ background: '#fff', padding: '1.5rem', borderRadius: 18, border: '1px solid #e2e8f0' }}><h2 style={{ marginTop: 0, fontSize: 20 }}>{title}</h2>{children}</section>;
}

function Empty({ text }) {
  return <p style={{ color: '#94a3b8', marginBottom: 0 }}>{text}</p>;
}
