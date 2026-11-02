'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin/rewards', label: 'Recompensas' },
  { href: '/admin/management', label: 'Administración' },
  { href: '/admin/tokens', label: 'APIs' },
  { href: '/client/login', label: 'Portal cliente' }
];

export default function AdminNav({ active }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <nav
      aria-label="Navegación principal"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0.875rem 1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#0f172a',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)'
      }}
    >
      <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 700 }}>
        Sistema de Lealtad
      </Link>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: active === link.href ? '#0f172a' : '#cbd5e1',
              backgroundColor: active === link.href ? '#f8fafc' : 'transparent',
              textDecoration: 'none',
              padding: '0.45rem 0.75rem',
              borderRadius: '0.4rem',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {link.label}
          </Link>
        ))}
        <button type="button" onClick={logout} style={{ color: '#fecaca', background: 'transparent', border: '1px solid #7f1d1d', padding: '0.45rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
