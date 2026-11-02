import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function AuthRedirectCheck() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session');

  let shouldRedirectToDashboard = false;

  if (sessionCookie && sessionCookie.value) {
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      if (sessionData && sessionData.id) {
        shouldRedirectToDashboard = true;
      }
    } catch (e) {
      console.error('Error al parsear la cookie de sesión:', e);
    }
  }

  if (shouldRedirectToDashboard) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}

export default function RootPage() {
  return (
    <Suspense fallback={<div style={{ padding: '30px', textAlign: 'center' }}>Cargando sistema...</div>}>
      <AuthRedirectCheck />
    </Suspense>
  );
}