'use client';

import { useState, useEffect } from 'react';
import { fetchDashboardMetrics, executeManualSync, searchCustomersApi } from './dashboard.model';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');

  const loadData = async () => {
    try {
      const metrics = await fetchDashboardMetrics();
      setData(metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      await executeManualSync();
      setSyncMessage('✅ Sincronización completada exitosamente.');
      loadData();
    } catch (err) {
      setSyncMessage(`❌ ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const results = await searchCustomersApi(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  return {
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
  };
}