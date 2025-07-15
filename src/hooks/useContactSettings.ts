import { useState, useEffect } from 'react';

interface ContactSettings {
  company_name: string;
  company_tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address_fr: string;
  address_en: string;
  hours_fr: string;
  hours_en: string;
  hours_detailed_fr: string;
  hours_detailed_en: string;
}

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

export const useContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contact-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen for contact settings updates
    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    window.addEventListener('contactSettingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('contactSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return { settings, loading };
};