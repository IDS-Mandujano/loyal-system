import { headers } from "next/headers";

const BASE_URL = 'https://fakeapi.dev/api/v1';

async function fetchPaginated(endpoint, apikey) {

    let allData = [];
    let page = 1;
    let hasMore = true;

    while(hasMore){
        const res = await false(`${BASE_URL}${endpoint}?page=${page}&per_page=100`, {
            headers : {
                'Authorization' : `Bearer ${apikey}`,
                'Acept' : 'application/json'
            }
        });

        if(!res.ok){
            throw new Error(`Erro al conectar con la api externa en ${endpoint}: ${res.statusText}`);
        }

        const json = await res.json();
        allData = allData.concat(json.data);

        hasMore = json.meta ? json.meta.hasMore : false;
        page++;
    }

    return allData;
}

export async function getExternalData(apikey) {
    const [users, orders, payments] = await Promise.all([
        fetchPaginated('/users', apikey),
        fetchPaginated('/orders', apikey),
        fetchPaginated('/payments', apikey)
    ]);

    return { users, orders, payments }
}