'use client';

import { useState, useEffect } from 'react';

export function useRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    points_required: '',
    stock: '',
    min_tier: 'Bronce',
    type: 'product',
    value: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/admin/rewards');
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards || []);
      }
    } catch (error) {
      console.error('Error cargando recompensas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchRewards, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

const handleFileChange = (file) => {
    if (file) {
      const maxSizeMB = 2;
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`La imagen es demasiado pesada. El tamaño máximo permitido es ${maxSizeMB} MB.`);
        return;
      }
      setImageFile(file);
    }
  };

  const createReward = async (e) => {
    e.preventDefault();
    setMessage('');

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessage('¡Recompensa creada con éxito!');
        setForm({
          name: '',
          description: '',
          points_required: '',
          stock: '',
          min_tier: 'Bronce',
          type: 'product',
          value: '',
          is_active: true
        });
        setImageFile(null);
        fetchRewards();
      } else {
        setMessage(`Error: ${data.error || 'No se pudo crear'}`);
      }
    } catch (error) {
      setMessage(`Error de red: ${error.message}`);
    }
  };

  return {
    rewards,
    loading,
    form,
    message,
    handleInputChange,
    handleFileChange,
    createReward
  };
}