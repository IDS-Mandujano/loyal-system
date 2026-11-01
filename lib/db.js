import { Pool } from "pg";

let pool = null;

function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : undefined;
        pool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return pool;
}

export default {
    query: (text, params) => getPool().query(text, params),
    getClient: () => getPool().connect()
};