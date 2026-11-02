export async function fetchDashboardMetrics() {
  const res = await fetch('/api/dashboard');
  if (res.status === 401) {
    window.location.href = '/auth/login';
    return;
  }
  const result = await res.json();
  if (!result.success) throw new Error(result.error || 'Error al cargar dashboard');
  return result;
}

export async function executeManualSync() {
    const res = await fetch('api/sync', { method : 'POST' });
    const result = await res.json();

    if (!res.ok || !result.success){
        throw Error(result.error || 'Error al sincronizar');
    }

    return result;
}

export async function searchCustomersApi(query) {
  if (!query.trim()) return [];
  const res = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
  
  if (!res.ok) {
    throw new Error(`Error en el servidor (${res.status})`);
  }
  
  const result = await res.json();
  return result.data || [];
}