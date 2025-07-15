import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Mail, Phone, MapPin, Clock, MessageCircle, Building } from 'lucide-react';

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

const ContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>({
    company_name: '',
    company_tagline: '',
    email: '',
    phone: '',
    whatsapp: '',
    address_fr: '',
    address_en: '',
    hours_fr: '',
    hours_en: '',
    hours_detailed_fr: '',
    hours_detailed_en: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contact-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          company_name: data.company_name || '',
          company_tagline: data.company_tagline || '',
          email: data.email || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          address_fr: data.address_fr || '',
          address_en: data.address_en || '',
          hours_fr: data.hours_fr || '',
          hours_en: data.hours_en || '',
          hours_detailed_fr: data.hours_detailed_fr || '',
          hours_detailed_en: data.hours_detailed_en || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ContactSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/contact-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: 'Paramètres sauvegardés',
          description: 'Les informations de contact ont été mises à jour avec succès.'
        });
        // Trigger a refresh of the contact settings across the app
        window.dispatchEvent(new CustomEvent('contactSettingsUpdated'));
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informations de l'entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name">Nom de l'entreprise</Label>
            <Input
              id="company_name"
              value={settings.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Signa Tech"
            />
          </div>
          <div>
            <Label htmlFor="company_tagline">Slogan/Tagline</Label>
            <Input
              id="company_tagline"
              value={settings.company_tagline}
              onChange={(e) => handleChange('company_tagline', e.target.value)}
              placeholder="Solutions PLV & Signalétique"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Coordonnées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Adresse Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contact@signatech.ma"
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+212 5 39 40 31 33"
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={settings.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="+212623537445"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address_fr">Adresse (Français)</Label>
            <Textarea
              id="address_fr"
              value={settings.address_fr}
              onChange={(e) => handleChange('address_fr', e.target.value)}
              placeholder="Zone Industrielle Gzenaya, lot 376, Tanger, Morocco"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="address_en">Adresse (English)</Label>
            <Textarea
              id="address_en"
              value={settings.address_en}
              onChange={(e) => handleChange('address_en', e.target.value)}
              placeholder="Industrial Zone Gzenaya, lot 376, Tangier, Morocco"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horaires d'ouverture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hours_fr">Horaires courts (Français)</Label>
            <Input
              id="hours_fr"
              value={settings.hours_fr}
              onChange={(e) => handleChange('hours_fr', e.target.value)}
              placeholder="Lun-Ven: 8h-18h | Sam: 8h-13h"
            />
          </div>
          <div>
            <Label htmlFor="hours_en">Horaires courts (English)</Label>
            <Input
              id="hours_en"
              value={settings.hours_en}
              onChange={(e) => handleChange('hours_en', e.target.value)}
              placeholder="Mon-Fri: 8am-6pm | Sat: 8am-1pm"
            />
          </div>
          <div>
            <Label htmlFor="hours_detailed_fr">Horaires détaillés (Français)</Label>
            <Input
              id="hours_detailed_fr"
              value={settings.hours_detailed_fr}
              onChange={(e) => handleChange('hours_detailed_fr', e.target.value)}
              placeholder="Lun - Ven: 8h00 - 18h00|Samedi: 8h00 - 13h00|Dimanche: Fermé"
            />
            <p className="text-sm text-muted-foreground mt-1">Séparez les lignes avec | (pipe)</p>
          </div>
          <div>
            <Label htmlFor="hours_detailed_en">Horaires détaillés (English)</Label>
            <Input
              id="hours_detailed_en"
              value={settings.hours_detailed_en}
              onChange={(e) => handleChange('hours_detailed_en', e.target.value)}
              placeholder="Mon - Fri: 8:00 AM - 6:00 PM|Saturday: 8:00 AM - 1:00 PM|Sunday: Closed"
            />
            <p className="text-sm text-muted-foreground mt-1">Séparez les lignes avec | (pipe)</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  );
};

export default ContactSettings;