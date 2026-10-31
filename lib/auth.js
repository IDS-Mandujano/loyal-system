import db from "./db";

export async function hasPermission(userId, permissionCode) {
    const client = await db.getClient();

    try {
        const result = await client.query(`
            SELECT 1 
            FROM internal_users iu
            JOIN role_permissions rp ON iu.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE iu.id = $1 AND p.code = $2 AND iu.is_active = TRUE
            `, [userId, permissionCode]);

        return result.rowCount > 0;
    } finally {
        client.release();
    }
}

export async function authenticateInternalUser(email, password) {
    const client = await db.getClient();
    try {
        const result = await client.query(`
            SELECT iu.id, iu.name, iu.email, iu.password_hash, iu.is_active, r.id as role_id, r.name as role_name
            FROM internal_users iu
            JOIN roles r ON iu.role_id = r.id
            WHERE iu.email = $1
        `, [email]);

        if (result.rowCount === 0) return null;

        const user = result.rows[0];
        if (!user.is_active) throw new Error('Usuario desactivado');

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        delete user.password_hash;
        return user;
    } finally {
        client.release();
    }
}

export async function hasPermission(userId, permissionCode) {
    const client = await db.getClient();

    try {
        const result = await client.query(`
            SELECT 1 
            FROM internal_users iu
            JOIN role_permissions rp ON iu.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE iu.id = $1 AND p.code = $2 AND iu.is_active = TRUE
        `, [userId, permissionCode]);

        return result.rowCount > 0;
    } finally {
        client.release();
    }
}