'use client';

import { use, Suspense } from 'react';
import { useCustomerDetail } from './useCustomerDetail';
import { CustomerInfoCard } from './components/CustomerInfoCard';
import { MovementsTable } from './components/MovementsTable';

export const dynamic = 'force-dynamic';

function CustomerDetailContent({ customerId }) {
  const {
    customer,
    loading,
    tempPassword,
    message,
    handleGenerateAccess
  } = useCustomerDetail(customerId);

  if (loading) return <div style={{ padding: '30px' }}>Cargando ficha del cliente...</div>;
  if (!customer) return <div style={{ padding: '30px' }}>Cliente no encontrado o sin autorización.</div>;

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <a href="/dashboard" style={{ color: '#0070f3', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Volver al Dashboard
      </a>

      <CustomerInfoCard 
        customer={customer} 
        onGenerateAccess={handleGenerateAccess} 
        tempPassword={tempPassword} 
        message={message} 
      />

      <MovementsTable movimientos={customer.movimientos} />
    </div>
  );
}

export default function CustomerDetailPage({ params }) {
  const unwrappedParams = use(Promise.resolve(params));
  
  return (
    <Suspense fallback={<div style={{ padding: '30px' }}>Cargando componentes...</div>}>
      <CustomerDetailContent customerId={unwrappedParams.id} />
    </Suspense>
  );
}