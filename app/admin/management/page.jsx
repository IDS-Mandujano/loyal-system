'use client';

import { useEffect, useState } from 'react';
import AdminNav from '../components/AdminNav';

export default function ManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role_id: '' });
  const [newRole, setNewRole] = useState({ name: '', permission_ids: [] });

  async function load() {
    const [usersResponse, rolesResponse, redemptionsResponse] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/roles'),
      fetch('/api/admin/redemptions')
    ]);
    if (usersResponse.ok) setUsers((await usersResponse.json()).users);
    if (rolesResponse.ok) {
      const data = await rolesResponse.json();
      setRoles(data.roles);
      setPermissions(data.permissions);
    }
    if (redemptionsResponse.ok) setRedemptions((await redemptionsResponse.json()).redemptions);
  }

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, []);

  async function createUser(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser)
    });
    const data = await response.json();
    setMessage(response.ok ? 'Usuario creado.' : data.error);
    if (response.ok) {
      setNewUser({ name: '', email: '', password: '', role_id: '' });
      load();
    }
  }

  async function toggleUser(user) {
    await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, is_active: !user.is_active })
    });
    load();
  }

  async function createRole(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/roles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRole)
    });
    setMessage(response.ok ? 'Rol creado.' : (await response.json()).error);
    if (response.ok) {
      setNewRole({ name: '', permission_ids: [] });
      load();
    }
  }

  async function updateRedemption(id, status) {
    const response = await fetch('/api/admin/redemptions', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status })
    });
    if (!response.ok) setMessage((await response.json()).error);
    load();
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <AdminNav active="/admin/management" />
      <header style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#2563eb', fontWeight: 700, margin: 0 }}>Panel interno</p>
        <h1 style={{ color: '#0f172a', margin: '0.35rem 0' }}>Administración</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Gestiona usuarios, roles, permisos y el ciclo de vida de los canjes.</p>
      </header>
      {message && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#166534', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.5rem' }}>{message}</div>}
      <section style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)', marginBottom: '1.5rem' }}>
        <h2>Usuarios internos</h2>
        <form onSubmit={createUser} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input required placeholder="Nombre" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
          <input required type="email" placeholder="Correo" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          <input required minLength={8} type="password" placeholder="Contraseña" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          <select required value={newUser.role_id} onChange={e => setNewUser({ ...newUser, role_id: e.target.value })}>
            <option value="">Rol</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
          <button>Crear usuario</button>
        </form>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 8 }}>{users.map(user => <li key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}><span><strong>{user.name}</strong> — {user.email} — {user.role_name} — <span style={{ color: user.is_active ? '#16a34a' : '#64748b' }}>{user.is_active ? 'Activo' : 'Inactivo'}</span></span><button onClick={() => toggleUser(user)}>{user.is_active ? 'Desactivar' : 'Activar'}</button></li>)}</ul>
      </section>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
        <h2>Roles y permisos</h2>
        <form onSubmit={createRole} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
          <input required placeholder="Nombre del rol" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} />
          <div>{permissions.map(permission => <label key={permission.id} style={{ display: 'block' }}><input type="checkbox" checked={newRole.permission_ids.includes(permission.id)} onChange={e => setNewRole({ ...newRole, permission_ids: e.target.checked ? [...newRole.permission_ids, permission.id] : newRole.permission_ids.filter(id => id !== permission.id) })} /> {permission.description || permission.code}</label>)}</div>
          <button>Crear rol</button>
        </form>
        <ul>{roles.map(role => <li key={role.id}>{role.name}</li>)}</ul>
      </div>
      <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
        <h2>Accesos rápidos</h2>
        <p style={{ color: '#64748b' }}>Usa la navegación superior para volver al dashboard o administrar recompensas.</p>
        <LinkButton href="/admin/rewards">Ir a recompensas</LinkButton>
      </div>
      </section>
      <section style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)' }}>
        <h2>Gestión de canjes</h2>
        <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>{redemptions.map(redemption => <li key={redemption.id} style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>{redemption.customer_name} — {redemption.reward_name} — {redemption.status} {redemption.coupon_code || ''}
          {redemption.status === 'pendiente' && <><button onClick={() => updateRedemption(redemption.id, 'entregado')}>Entregar</button><button onClick={() => updateRedemption(redemption.id, 'cancelado')}>Cancelar</button></>}</li>)}</ul>
      </section>
    </main>
  );
}

function LinkButton({ href, children }) {
  return <a href={href} style={{ display: 'inline-block', padding: '0.6rem 0.9rem', borderRadius: '0.4rem', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', fontWeight: 600 }}>{children}</a>;
}
