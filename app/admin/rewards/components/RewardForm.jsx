'use client';

export function RewardForm({ form, onInputChange, onFileChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
      <h3>Crear Nueva Recompensa</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label>Nombre:</label>
          <input 
            type="text" 
            value={form.name} 
            onChange={e => onInputChange('name', e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
        <div>
          <label>Puntos Requeridos:</label>
          <input 
            type="number" 
            value={form.points_required} 
            onChange={e => onInputChange('points_required', e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
        <div>
          <label>Stock:</label>
          <input 
            type="number" 
            value={form.stock} 
            onChange={e => onInputChange('stock', e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
        <div>
          <label>Nivel Mínimo:</label>
          <select value={form.min_tier} onChange={e => onInputChange('min_tier', e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="Bronce">Bronce</option>
            <option value="Plata">Plata</option>
            <option value="Oro">Oro</option>
          </select>
        </div>
        <div>
          <label>Tipo:</label>
          <select value={form.type} onChange={e => onInputChange('type', e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="product">Producto físico</option>
            <option value="discount">Descuento / Cupón</option>
          </select>
        </div>
        <div>
          <label>Valor (MXN o %):</label>
          <input 
            type="number" 
            value={form.value} 
            onChange={e => onInputChange('value', e.target.value)} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Descripción:</label>
        <textarea value={form.description} onChange={e => onInputChange('description', e.target.value)} style={{ width: '100%', padding: '8px' }} rows="2" />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Imagen de la Recompensa (Supabase Storage):</label>
        <input type="file" onChange={e => onFileChange(e.target.files[0])} accept="image/*" style={{ display: 'block', marginTop: '5px' }} />
      </div>
      <button type="submit" style={{ background: '#0070f3', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Guardar Recompensa
      </button>
    </form>
  );
}