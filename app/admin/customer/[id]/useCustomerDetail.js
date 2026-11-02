'use client';

import { useState, useEffect } from 'react';

export function useCustomerDetail(customerId) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempPassword, setTempPassword] = useState(null);
  const [message, setMessage] = useState('');

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchCustomerDetail = async () => {
    if (!customerId) return;
    try {
      const res = await fetch(`/api/fidelizacion/clientes/${customerId}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setCustomer(data);
      } else {
        console.error('Error de API:', data);
      }
    } catch (error) {
      console.error('Error cargando detalle del cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [customerId]);

  const handleGenerateAccess = async () => {
    if (!confirm('¿Estás seguro de generar un nuevo acceso temporal para este cliente? Esto invalidará el anterior.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers/${customerId}/access`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();

      if (data.success) {
        setTempPassword(data.tempPassword);
        setMessage('¡Acceso generado con éxito! Copia la contraseña temporal, solo se muestra esta vez.');
      } else {
        setMessage(`Error: ${data.error || 'No se pudo generar el acceso'}`);
      }
    } catch (error) {
      setMessage(`Error de red: ${error.message}`);
    }
  };

  return {
    customer,
    loading,
    tempPassword,
    message,
    handleGenerateAccess
  };
}