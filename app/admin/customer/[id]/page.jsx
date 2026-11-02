'use client';

import { Suspense } from 'react';
import { use } from 'react';
import { useCustomerDetail } from './useCustomerDetail';
import { CustomerInfoCard } from './components/CustomerInfoCard';
import { MovementsTable } from './components/MovementsTable';
import AdminNav from '../../components/AdminNav';

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
      <AdminNav active="/dashboard" />
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
  return (
    <Suspense fallback={<div style={{ padding: '30px' }}>Cargando página...</div>}>
      <ParamsResolver params={params} />
    </Suspense>
  );
}

function ParamsResolver({ params }) {
  const unwrappedParams = use(params);
  return <CustomerDetailContent customerId={unwrappedParams.id} />;
}