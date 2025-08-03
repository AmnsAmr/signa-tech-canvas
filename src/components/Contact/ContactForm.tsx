import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';
import ServiceManager from './ServiceManager';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { ContactApi } from '@/api';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  project: string;
  message: string;
  services: any[];
  vectorFile?: File | null;
}

interface ContactFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const ContactForm: React.FC<ContactFormProps> = ({ formData, setFormData }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileSelect = (file: File | null) => {
    setFormData((prevData) => ({ ...prevData, vectorFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('submitting');

    if (!isAuthenticated && (!formData.name || !formData.phone || !formData.message)) {
      toast({
        title: "Champs requis",
        description: "Nom, téléphone et message sont requis.",
        variant: "destructive"
      });
      setSubmissionStatus('idle');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'vectorFile') {
          if (formData.vectorFile) {
            formDataToSend.append('vectorFile', formData.vectorFile);
          }
        } else if (key === 'services') {
          formDataToSend.append('services', JSON.stringify(formData.services));
        } else {
          const value = formData[key as keyof FormData];
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, String(value));
          }
        }
      });
      
      const response = isAuthenticated 
        ? await ContactApi.submitAuthenticated(formDataToSend)
        : await ContactApi.submitGuest(formDataToSend);

      if (response.success) {
        setSubmissionStatus('success');
        setFormData({
          name: isAuthenticated ? user?.name || '' : '',
          company: isAuthenticated ? user?.company || '' : '',
          email: isAuthenticated ? user?.email || '' : '',
          phone: isAuthenticated ? user?.phone || '' : '',
          project: '',
          message: '',
          services: [],
          vectorFile: null
        });
        toast({
          title: "Message envoyé",
          description: response.data?.message || "Votre message a été envoyé avec succès"
        });
      } else {
        setSubmissionStatus('error');
        toast({
          title: "Erreur",
          description: response.error || "Échec de l'envoi du message.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setSubmissionStatus('error');
      toast({
        title: "Erreur",
        description: "Échec de l'envoi du message. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-glow hover:shadow-pink transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
      <CardContent className="p-12 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-foreground mb-4">
            {t('contact.form.title')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('contact.form.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isAuthenticated ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-sm text-green-700 mb-2">{t('contact.logged_in_as')}: <strong>{user?.name}</strong></p>
              <p className="text-xs text-green-600">{t('contact.info_prefilled')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('contact.form.name.label')} *
                  </label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contact.form.name.placeholder')}
                    className="border-border/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('contact.form.company.label')}
                  </label>
                  <Input 
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t('contact.form.company.placeholder')}
                    className="border-border/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('contact.form.email.label')}
                  </label>
                  <Input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contact.form.email.placeholder')}
                    className="border-border/50 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('contact.form.phone.label')} *
                  </label>
                  <Input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('contact.form.phone.placeholder')}
                    className="border-border/50 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('contact.form.project.label')}
            </label>
            <select 
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full p-3 border border-border/50 rounded-lg focus:border-primary transition-colors bg-background"
            >
              <option value="">{t('contact.form.project.placeholder')}</option>
              <option value="option1">{t('contact.form.project.option1')}</option>
              <option value="option2">{t('contact.form.project.option2')}</option>
              <option value="option3">{t('contact.form.project.option3')}</option>
              <option value="option4">{t('contact.form.project.option4')}</option>
              <option value="option5">{t('contact.form.project.option5')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('contact.form.message.label')} *
            </label>
            <Textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('contact.form.message.placeholder')}
              rows={6}
              className="border-border/50 focus:border-primary transition-colors resize-none"
              required
            />
          </div>

          <FileUpload 
            onFileSelect={handleFileSelect}
            acceptedFormats={['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc']}
            maxSize={10}
          />

          <ServiceManager formData={formData} setFormData={setFormData} />

          {!isAuthenticated && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">
                💡 <strong>{t('contact.tip')}:</strong> {t('contact.create_account_tip')}
              </p>
              <p className="text-xs text-blue-600">
                {t('contact.logged_users_benefit')}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-4 text-lg transition-all duration-300 group"
            disabled={submissionStatus === 'submitting'}
          >
            <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            {submissionStatus === 'submitting' ? t('contact.form.sending') : t('contact.form.send')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;