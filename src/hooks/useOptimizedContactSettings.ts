import { useState, useEffect, useCallback } from 'react';
import { ContactApi } from '@/api';
import { ContactSettings } from '@/api/types';

const defaultSettings: ContactSettings = {
  company_name: 'Signa Tech',
  company_tagline: 'Solutions PLV & Signalétique',
  email: 'contact@signatech.ma',
  phone: '+212 5 39 40 31 33',
  whatsapp: '+212623537445',
  address_fr: 'Zone Industrielle Gzenaya, lot 376, Tanger, Morocco',
  address_en: 'Industrial Zone Gzenaya, lot 376, Tangier, Morocco',
  hours_fr: 'Lun-Ven: 8h-18h | Sam: 8h-13h',
  hours_en: 'Mon-Fri: 8am-6pm | Sat: 8am-1pm',
  hours_detailed_fr: 'Lun - Ven: 8h00 - 18h00|Samedi: 8h00 - 13h00|Dimanche: Fermé',
  hours_detailed_en: 'Mon - Fri: 8:00 AM - 6:00 PM|Saturday: 8:00 AM - 1:00 PM|Sunday: Closed'
};

export const useOptimizedContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ContactApi.getSettings();
      
      if (response.success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data
        }));
      } else {
        setError(response.error || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch contact settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('contactSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('contactSettingsUpdated', handleSettingsUpdate);
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<ContactSettings>) => {
    const response = await ContactApi.updateSettings(newSettings);
    if (response.success) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...response.data
      }));
      window.dispatchEvent(new CustomEvent('contactSettingsUpdated'));
    }
    return response;
  }, []);

  return { 
    settings, 
    loading, 
    error, 
    updateSettings,
    refetch: fetchSettings 
  };
};