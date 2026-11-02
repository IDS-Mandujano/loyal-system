'use client';

import { useEffect, useState } from 'react';
import AdminNav from '../components/AdminNav';

export default function ManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPermissionsUser, setSelectedPermissionsUser] = useState(null);
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role_id: '' });
  const [newRole, setNewRole] = useState({ name: '', permission_ids: [] });

  async function load() {
    const [usersResponse, rolesResponse, redemptionsResponse, meResponse] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/roles'),
      fetch('/api/admin/redemptions'),
      fetch('/api/auth/me')
    ]);
    if (usersResponse.ok) setUsers((await usersResponse.json()).users);
    if (rolesResponse.ok) {
      const data = await rolesResponse.json();
      setRoles(data.roles);
      setPermissions(data.permissions);
    }
    if (redemptionsResponse.ok) setRedemptions((await redemptionsResponse.json()).redemptions);
    if (meResponse.ok) setCurrentUser((await meResponse.json()).user);
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
      <header style={{ marginBottom: '1.75rem' }}>
        <p style={{ color: '#2563eb', fontWeight: 700, margin: 0 }}>Panel interno</p>
        <h1 style={{ color: '#0f172a', margin: '0.35rem 0', fontSize: 32 }}>Centro de administración</h1>
        <p style={{ color: '#64748b', margin: 0, maxWidth: 680 }}>Gestiona el equipo interno, define permisos y supervisa el ciclo de vida de los canjes.</p>
      </header>
      {currentUser && <section style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#0f172a', color: '#fff' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...avatarStyle, background: '#2563eb', color: '#fff' }}>{currentUser.name.charAt(0).toUpperCase()}</span>
          <span><small style={{ display: 'block', color: '#93c5fd', fontWeight: 700 }}>SESIÓN ACTIVA</small><strong style={{ display: 'block', fontSize: 17 }}>{currentUser.name}</strong><small style={{ color: '#cbd5e1' }}>{currentUser.email} · {currentUser.role_name}</small></span>
        </span>
        <span style={{ color: '#86efac', fontSize: 13, fontWeight: 700 }}>● Cuenta activa · {currentUser.permissions.length} permisos</span>
      </section>}
      {message && <div style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#166534', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, fontWeight: 600 }}>{message}</div>}
      <section style={cardStyle}>
        <SectionHeading eyebrow="Equipo" title="Usuarios internos" description="Crea cuentas y controla quién puede acceder al panel." />
        <form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: 12 }}>
          <input required placeholder="Nombre completo" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={inputStyle} />
          <input required type="email" placeholder="Correo electrónico" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} style={inputStyle} />
          <input required minLength={8} type="password" placeholder="Contraseña inicial" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={inputStyle} />
          <select required value={newUser.role_id} onChange={e => setNewUser({ ...newUser, role_id: e.target.value })} style={inputStyle}>
            <option value="">Rol</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
          <button style={primaryButton}>+ Crear usuario</button>
        </form>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: 10 }}>{users.map(user => <li key={user.id} style={listItemStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={avatarStyle}>{user.name?.charAt(0).toUpperCase()}</span>
            <span><strong style={{ display: 'block' }}>{user.name}</strong><small style={{ color: '#64748b' }}>{user.email} · {user.role_name}</small></span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: user.is_active ? '#15803d' : '#64748b', fontSize: 13, fontWeight: 700 }}>{user.is_active ? '● Activo' : '○ Inactivo'}</span>
            <button onClick={() => setSelectedPermissionsUser(user)} style={secondaryButton}>Ver capacidades</button>
            <button onClick={() => toggleUser(user)} style={secondaryButton}>{user.is_active ? 'Desactivar' : 'Activar'}</button>
          </span>
        </li>)}</ul>
        {selectedPermissionsUser && <PermissionSummary user={selectedPermissionsUser} roles={roles} onClose={() => setSelectedPermissionsUser(null)} />}
      </section>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={cardStyle}>
        <SectionHeading eyebrow="Seguridad" title="Roles y permisos" description="Define el alcance de cada perfil del equipo." />
        <form onSubmit={createRole} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
          <input required placeholder="Nombre del nuevo rol" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} style={inputStyle} />
          <div style={{ display: 'grid', gap: 8, padding: '0.75rem', background: '#f8fafc', borderRadius: 10 }}>{permissions.map(permission => <label key={permission.id} style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#475569', fontSize: 14 }}><input type="checkbox" checked={newRole.permission_ids.includes(permission.id)} onChange={e => setNewRole({ ...newRole, permission_ids: e.target.checked ? [...newRole.permission_ids, permission.id] : newRole.permission_ids.filter(id => id !== permission.id) })} /> {permission.description || permission.code}</label>)}</div>
          <button style={primaryButton}>+ Crear rol</button>
        </form>
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>{roles.map(role => <article key={role.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}><strong>{role.name}</strong><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{role.permissions?.length ? role.permissions.map(permission => <span key={permission.code} style={permissionChip}>{permission.description || permission.code}</span>) : <small style={{ color: '#94a3b8' }}>Sin permisos asignados</small>}</div></article>)}</div>
      </div>
      <div style={{ ...cardStyle, background: '#0f172a', color: '#fff' }}>
        <p style={{ margin: 0, color: '#93c5fd', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Accesos rápidos</p>
        <h2 style={{ margin: '0.5rem 0' }}>Todo bajo control</h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>Administra recompensas, tokens y operaciones desde la navegación principal.</p>
        <LinkButton href="/admin/rewards">Ir a recompensas</LinkButton>
      </div>
      </section>
      <section style={cardStyle}>
        <SectionHeading eyebrow="Operaciones" title="Gestión de canjes" description="Actualiza el estado de las recompensas solicitadas por los clientes." />
        <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>{redemptions.map(redemption => <li key={redemption.id} style={listItemStyle}><span><strong style={{ display: 'block' }}>{redemption.customer_name}</strong><small style={{ color: '#64748b' }}>{redemption.reward_name} · {redemption.status} {redemption.coupon_code ? `· ${redemption.coupon_code}` : ''}</small></span>
          {redemption.status === 'pendiente' && <span style={{ display: 'flex', gap: 8 }}><button onClick={() => updateRedemption(redemption.id, 'entregado')} style={successButton}>Entregar</button><button onClick={() => updateRedemption(redemption.id, 'cancelado')} style={dangerButton}>Cancelar</button></span>}</li>)}</ul>
      </section>
    </main>
  );
}

function LinkButton({ href, children }) {
  return <a href={href} style={{ display: 'inline-block', padding: '0.7rem 0.9rem', borderRadius: '0.55rem', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', fontWeight: 700 }}>{children}</a>;
}

const cardStyle = { backgroundColor: '#fff', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)', marginBottom: '1.5rem' };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.75rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: 9, background: '#fff', fontSize: 14 };
const primaryButton = { padding: '0.72rem 1rem', border: 0, borderRadius: 9, background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const secondaryButton = { padding: '0.45rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' };
const successButton = { ...secondaryButton, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' };
const dangerButton = { ...secondaryButton, color: '#b91c1c', borderColor: '#fecaca', background: '#fff1f2' };
const listItemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '0.9rem', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 11 };
const avatarStyle = { width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontWeight: 800 };
const permissionChip = { padding: '0.3rem 0.5rem', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8', fontSize: 11, fontWeight: 700 };
function SectionHeading({ eyebrow, title, description }) {
  return <div style={{ marginBottom: '1rem' }}><p style={{ margin: 0, color: '#2563eb', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{eyebrow}</p><h2 style={{ margin: '0.3rem 0', fontSize: 22 }}>{title}</h2><p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{description}</p></div>;
}

function PermissionSummary({ user, roles, onClose }) {
  const role = roles.find(item => item.id === user.role_id);
  return <div style={{ marginTop: 14, padding: '1rem', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong>Capacidades de {user.name}</strong><button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 }}>Cerrar</button></div>
    <p style={{ margin: '0.4rem 0', color: '#475569', fontSize: 14 }}>Rol asignado: <strong>{user.role_name}</strong>. Estas son sus acciones permitidas:</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{role?.permissions?.map(permission => <span key={permission.code} style={permissionChip}>✓ {permission.description || permission.code}</span>) || <span style={{ color: '#64748b' }}>No hay permisos asignados.</span>}</div>
    <p style={{ margin: '0.75rem 0 0', color: '#64748b', fontSize: 12 }}>Cualquier endpoint sin uno de estos permisos debe responder 403; ocultar botones no sustituye la validación del backend.</p>
  </div>;
}
