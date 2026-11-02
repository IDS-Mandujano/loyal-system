'use client';

import { useDashboard } from './useDashboard';
import HeaderSync from './components/HeaderSync';
import TierCards from './components/TierCards';
import CustomerSearch from './components/CustomerSearch';
import TopCustomersTable from './components/TopCustomersTable';
import CustomerAlerts from './components/CustomerAlerts';
import AdminNav from '../admin/components/AdminNav';

export default function DashboardPage() {
  const {
    data,
    loading,
    syncing,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedCustomer,
    setSelectedCustomer,
    syncMessage,
    handleSync,
    handleSearch
  } = useDashboard();

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b', background: '#f8fafc' }}>Cargando panel...</div>;

  return (
    <div style={{ padding: '2rem 1.25rem 4rem', fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #ecfeff 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <AdminNav active="/dashboard" />
      <HeaderSync 
        onSync={handleSync} 
        syncing={syncing} 
        syncMessage={syncMessage} 
      />

      <TierCards tiers={data?.tiers} />

      <CustomerSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchResults={searchResults}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <TopCustomersTable top10={data?.top10} />
        <CustomerAlerts inRisk={data?.inRisk} birthdays={data?.birthdays} />
      </div>
      </div>
    </div>
  );
}