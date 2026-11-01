const BASE_URL = 'https://fakeapi.dev/api/v1';

async function fetchPaginated(endpoint, apiKey) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  console.log(`➡️ [API] Iniciando descarga de ${endpoint}...`);

  while (hasMore) {
    console.log(`📥 [API] Consultando ${endpoint} - Página ${page}`);
    
    const res = await fetch(`${BASE_URL}${endpoint}?page=${page}&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Error al conectar con la API externa en ${endpoint}: ${res.statusText}`);
    }
    
    const json = await res.json();
    
    if (!json.data || json.data.length === 0) {
      break;
    }

    allData = allData.concat(json.data);
    hasMore = json.meta ? json.meta.has_more : false;
    page++;
  }

  console.log(`✅ [API] Total obtenido de ${endpoint}: ${allData.length} registros.`);
  return allData;
}

export async function getExternalData(apiKey) {
  console.log('🚀 Iniciando sincronización con API externa...');
  
  const users = await fetchPaginated('/users', apiKey);
  const orders = await fetchPaginated('/orders', apiKey);
  const payments = await fetchPaginated('/payments', apiKey);

  console.log('🎉 ¡Descarga completa de todas las fuentes externas!');
  return { users, orders, payments };
}