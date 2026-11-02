'use client';

import { useEffect, useState } from 'react';

export function RewardForm({ form, onInputChange, onFileChange, onSubmit, imageFile }) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!imageFile) {
      const timer = setTimeout(() => setPreviewUrl(''), 0);
      return () => clearTimeout(timer);
    }
    const url = URL.createObjectURL(imageFile);
    const timer = setTimeout(() => setPreviewUrl(url), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  return (
    <form onSubmit={onSubmit} style={{ background: '#fff', padding: '1.75rem', borderRadius: 18, marginBottom: 30, border: '1px solid #dbeafe', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ margin: 0, color: '#2563eb', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nuevo beneficio</p>
          <h2 style={{ margin: '0.35rem 0', fontSize: 22 }}>Crea una recompensa</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Completa los datos para publicarla en el portal del cliente.</p>
        </div>
        <span style={{ padding: '0.45rem 0.7rem', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700 }}>PUBLICACIÓN INSTANTÁNEA</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)', gap: 24 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 14 }}>
            <Field label="Nombre de la recompensa" required>
              <input type="text" value={form.name} onChange={e => onInputChange('name', e.target.value)} required placeholder="Ej. Café gratis" style={inputStyle} />
            </Field>
            <Field label="Puntos requeridos" required>
              <input type="number" min="1" value={form.points_required} onChange={e => onInputChange('points_required', e.target.value)} required placeholder="500" style={inputStyle} />
            </Field>
            <Field label="Stock disponible" required>
              <input type="number" min="0" value={form.stock} onChange={e => onInputChange('stock', e.target.value)} required placeholder="20" style={inputStyle} />
            </Field>
            <Field label="Nivel mínimo">
              <select value={form.min_tier} onChange={e => onInputChange('min_tier', e.target.value)} style={inputStyle}>
                <option value="Bronce">Bronce</option><option value="Plata">Plata</option><option value="Oro">Oro</option>
              </select>
            </Field>
            <Field label="Tipo de beneficio">
              <select value={form.type} onChange={e => onInputChange('type', e.target.value)} style={inputStyle}>
                <option value="product">Producto físico</option><option value="discount">Descuento / Cupón</option>
              </select>
            </Field>
            <Field label="Valor (MXN o %)">
              <input type="number" min="0" value={form.value} onChange={e => onInputChange('value', e.target.value)} placeholder="10" style={inputStyle} />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => onInputChange('description', e.target.value)} placeholder="Describe brevemente qué recibirá el cliente..." rows="4" style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
        </div>

        <div style={{ padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#334155' }}>Imagen del beneficio</p>
          <div style={{ height: 150, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 10, background: previewUrl ? '#fff' : '#e0f2fe', border: '1px dashed #93c5fd', marginBottom: 12 }}>
            {previewUrl ? <img src={previewUrl} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#2563eb', fontSize: 13, textAlign: 'center', padding: 20 }}>La imagen aparecerá aquí<br />como vista previa</span>}
          </div>
          <input type="file" onChange={e => onFileChange(e.target.files[0])} accept="image/*" style={{ width: '100%', fontSize: 12 }} />
          <small style={{ display: 'block', marginTop: 8, color: '#64748b', lineHeight: 1.4 }}>JPG, PNG o WEBP. Tamaño máximo: 2 MB.</small>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
        <button type="submit" style={buttonStyle}>Publicar recompensa</button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return <label style={{ display: 'grid', gap: 7, color: '#475569', fontWeight: 700, fontSize: 13 }}>{label}{required && <span style={{ color: '#2563eb' }}> *</span>}{children}</label>;
}

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.75rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: 9, background: '#fff', fontSize: 14, color: '#0f172a' };
const buttonStyle = { padding: '0.8rem 1.15rem', border: 0, borderRadius: 9, background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' };
