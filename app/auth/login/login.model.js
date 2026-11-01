export async function loginUser(email, password) {
    const res = await fetch('/api/auth/login', {
        method : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body : JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (!res.ok || !result.success){
        throw new Error(result.error || 'Error al iniciar sesión.');
    }

    return result
}