import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/Auth/AuthModal';
import SEOHead from '@/components/SEOHead';
import { useImageCache } from '@/hooks/useImageCache';
import ImageLoader from '@/components/ImageLoader';

import { useOptimizedContactSettings } from '@/hooks/useOptimizedContactSettings';
import { 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Zap,
  Heart,
  Settings,
  User,
  LucideIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ServiceSpec {
  id: string;
  serviceType: string;
  material: string;
  size: string;
  quantity: string;
  thickness: string;
  colors: string;
  finishing: string;
  cuttingApplication: string;
  designReady: string;
  cncFinishing: string;
  jobType: string;
  detailLevel: string;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  project: string;
  message: string;
  services: ServiceSpec[];
}

interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon: Icon, title, value }) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const handleEmailClick = () => {
    if (title.toLowerCase().includes('email') || title.toLowerCase().includes('e-mail')) {
      setShowEmailDialog(true);
    }
  };
  
  const handleEmailConfirm = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${value}`, '_blank');
    setShowEmailDialog(false);
  };
  
  return (
    <>
      <Card className="group hover:shadow-glow transition-all duration-300 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p 
                className={`text-muted-foreground ${
                  title.toLowerCase().includes('email') || title.toLowerCase().includes('e-mail') 
                    ? 'cursor-pointer hover:text-primary transition-colors' 
                    : ''
                }`}
                onClick={handleEmailClick}
              >
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ouvrir Gmail</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous ouvrir Gmail pour continuer la conversation à l'adresse {value} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmailConfirm}>Ouvrir Gmail</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const Contact: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const { settings } = useOptimizedContactSettings();
  const { images: contactImages } = useImageCache('contact');
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: isAuthenticated ? user?.name || '' : '',
    company: isAuthenticated ? user?.company || '' : '',
    email: isAuthenticated ? user?.email || '' : '',
    phone: isAuthenticated ? user?.phone || '' : '',
    project: '',
    message: '',
    services: []
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceSpec>({
    id: '',
    serviceType: '',
    material: '',
    size: '',
    quantity: '',
    thickness: '',
    colors: '',
    finishing: '',
    cuttingApplication: '',
    designReady: '',
    cncFinishing: '',
    jobType: '',
    detailLevel: ''
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Add timeout for loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('submitting');

    // Validation for non-authenticated users
    if (!isAuthenticated) {
      if (!formData.name || !formData.phone || !formData.message) {
        toast({
          title: "Champs requis",
          description: "Nom, téléphone et message sont requis.",
          variant: "destructive"
        });
        setSubmissionStatus('idle');
        return;
      }
    }

    const token = localStorage.getItem('token');
    const backendUrl = isAuthenticated ? 'http://localhost:5000/api/contact/submit' : 'http://localhost:5000/api/contact/guest-submit';

    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmissionStatus('success');
        // Reset form but keep user data for authenticated users
        setFormData({
          name: isAuthenticated ? user?.name || '' : '',
          company: isAuthenticated ? user?.company || '' : '',
          email: isAuthenticated ? user?.email || '' : '',
          phone: isAuthenticated ? user?.phone || '' : '',
          project: '',
          message: '',
          services: []
        });
        toast({
          title: "Message envoyé",
          description: result.message
        });
      } else {
        setSubmissionStatus('error');
        toast({
          title: "Erreur",
          description: result.message || "Échec de l'envoi du message.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus('error');
      toast({
        title: "Erreur",
        description: "Échec de l'envoi du message. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={t('contact.hero.title1') + ' ' + t('contact.hero.title2') + ' - Signa Tech'}
        description={t('contact.hero.subtitle')}
        path="/contact"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          {contactImages[0] && (
            <div className="absolute inset-0 opacity-20">
              <ImageLoader
                filename={contactImages[0].filename}
                alt="Contact background"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-4xl mx-auto">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 text-lg px-8 py-3">
              <Heart className="mr-2 h-5 w-5" />
              {t('contact.hero.badge')}
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              {t('contact.hero.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('contact.hero.title2')}
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl leading-relaxed font-light">
              {t('contact.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
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
                    // Authenticated user form - pre-filled with user data
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                      <p className="text-sm text-green-700 mb-2">Connecté en tant que: <strong>{user?.name}</strong></p>
                      <p className="text-xs text-green-600">Vos informations sont pré-remplies</p>
                    </div>
                  ) : (
                    // Non-authenticated user form
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
                            Email
                          </label>
                          <Input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre@email.com (optionnel)"
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
                      name="project" // Add name attribute
                      value={formData.project} // Bind value to state
                      onChange={handleChange} // Add onChange handler
                      className="w-full p-3 border border-border/50 rounded-lg focus:border-primary transition-colors bg-background"
                    >
                      <option value="">{t('contact.form.project.placeholder')}</option> {/* Add value attribute */}
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
                    />
                  </div>

                  {/* Service Management Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Services Requis</h3>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentService({
                            id: Date.now().toString(),
                            serviceType: '',
                            material: '',
                            size: '',
                            quantity: '',
                            thickness: '',
                            colors: '',
                            finishing: '',
                            cuttingApplication: '',
                            designReady: '',
                            cncFinishing: '',
                            jobType: '',
                            detailLevel: ''
                          });
                          setEditingServiceId(null);
                          setShowServiceModal(true);
                        }}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Ajouter un Service
                      </Button>
                    </div>

                    {/* Display Added Services */}
                    {formData.services.length > 0 && (
                      <div className="space-y-3">
                        {formData.services.map((service, index) => (
                          <Card key={service.id} className="p-4 bg-gradient-subtle border border-primary/20">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground mb-1">
                                  Service {index + 1}: {service.serviceType || 'Non spécifié'}
                                </h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {service.material && <p>Matériau: {service.material}</p>}
                                  {service.size && <p>Taille: {service.size}</p>}
                                  {service.quantity && <p>Quantité: {service.quantity}</p>}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentService(service);
                                    setEditingServiceId(service.id);
                                    setShowServiceModal(true);
                                  }}
                                >
                                  Modifier
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      services: prev.services.filter(s => s.id !== service.id)
                                    }));
                                  }}
                                >
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>



                  {!isAuthenticated && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 mb-2">
                        💡 <strong>Conseil:</strong> Créez un compte pour une expérience plus rapide!
                      </p>
                      <p className="text-xs text-blue-600">
                        Les utilisateurs connectés n'ont pas besoin de ressaisir leurs informations.
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

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-foreground mb-8">
                  {t('contact.info.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {t('contact.info.subtitle')}
                </p>
              </div>

              <div className="space-y-6">
              <ContactCard 
                icon={Phone} 
                title={t('contact.info.phone.title')} 
                value={settings.phone} 
              />
              <ContactCard 
                icon={Mail} 
                title={t('contact.info.email.title')} 
                value={settings.email} 
              />
              <ContactCard 
                icon={MapPin} 
                title={t('contact.info.address.title')} 
                value={language === 'fr' ? settings.address_fr : settings.address_en} 
              />
              <ContactCard 
                icon={Clock} 
                title={t('contact.info.hours.title')} 
                value={language === 'fr' ? settings.hours_fr : settings.hours_en} 
              />
                 <Button 
                asChild
                size="lg" 
                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-glow hover:shadow-strong transition-all text-lg py-6 transform hover:scale-105"
              >
                <a 
                  href={`https://wa.me/${settings.whatsapp?.replace(/\+/g, '').replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  {t('contact.whatsapp')}
                </a>
              </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Trouvez-nous</h2>
            <p className="text-muted-foreground">Zone Industrielle Gzenaya, Tanger</p>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-strong">
            <div className="aspect-[16/10]">
              <iframe
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2505.6213869187595!2d-5.902106889775268!3d35.71167407246298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b897d4f10addf%3A0x750ef0252561ca92!2sSIGNATECH!5e0!3m2!1sen!2sma!4v1752152038428!5m2!1sen!2sma" 
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Signa Tech Location"
              ></iframe>
            </div>
          </Card>
        </div>
      </section>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Don't close modal on backdrop click - preserve user input
            }}
          />
          
          {/* Modal Content */}
          <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  {editingServiceId ? 'Modifier le Service' : 'Ajouter un Service'}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Service Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type de Service *
                  </label>
                  <Select 
                    value={currentService.serviceType} 
                    onValueChange={(value) => setCurrentService(prev => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger className="border-border/50 focus:border-primary">
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="printing">Impression</SelectItem>
                      <SelectItem value="cutting">Découpe</SelectItem>
                      <SelectItem value="cnc">CNC</SelectItem>
                      <SelectItem value="laser">Laser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Fields Based on Service Type */}
                {currentService.serviceType && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Material Selection */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Matériau
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const materials = {
                            printing: ['Forex', 'Alucobond', 'Plexiglass', 'Vinyle', 'Bâche', 'Toile'],
                            cutting: ['Vinyle', 'Flex'],
                            cnc: ['Forex', 'Plexiglass', 'Aluminum', 'Bois'],
                            laser: ['Plexiglass', 'Bois']
                          };
                          return materials[currentService.serviceType as keyof typeof materials]?.map((material) => (
                            <button
                              key={material}
                              type="button"
                              onClick={() => setCurrentService(prev => ({ 
                                ...prev, 
                                material: prev.material === material ? '' : material 
                              }))}
                              className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                currentService.material === material
                                  ? 'bg-gradient-primary text-white border-primary shadow-glow'
                                  : 'bg-background border-border/50 hover:border-primary/50 hover:bg-primary/5'
                              }`}
                            >
                              {material}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Taille
                        </label>
                        <Input 
                          value={currentService.size}
                          onChange={(e) => setCurrentService(prev => ({ ...prev, size: e.target.value }))}
                          placeholder="ex: 100cm × 70cm"
                          className="border-border/50 focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Quantité
                        </label>
                        <Input 
                          value={currentService.quantity}
                          onChange={(e) => setCurrentService(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="ex: 10 pièces"
                          className="border-border/50 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>

                    {/* Service-Specific Fields */}
                    {(currentService.serviceType === 'cutting' || currentService.serviceType === 'cnc' || currentService.serviceType === 'laser') && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Épaisseur
                        </label>
                        <Input 
                          value={currentService.thickness}
                          onChange={(e) => setCurrentService(prev => ({ ...prev, thickness: e.target.value }))}
                          placeholder="ex: 3mm"
                          className="border-border/50 focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {currentService.serviceType === 'cutting' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Couleurs
                        </label>
                        <Input 
                          value={currentService.colors}
                          onChange={(e) => setCurrentService(prev => ({ ...prev, colors: e.target.value }))}
                          placeholder="Rouge, bleu, blanc..."
                          className="border-border/50 focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {currentService.serviceType === 'printing' && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Finition
                        </label>
                        <Input 
                          value={currentService.finishing}
                          onChange={(e) => setCurrentService(prev => ({ ...prev, finishing: e.target.value }))}
                          placeholder="Mat, brillant, laminé, monté..."
                          className="border-border/50 focus:border-primary transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowServiceModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!currentService.serviceType) {
                        toast({
                          title: "Erreur",
                          description: "Veuillez sélectionner un type de service",
                          variant: "destructive"
                        });
                        return;
                      }

                      if (editingServiceId) {
                        // Update existing service
                        setFormData(prev => ({
                          ...prev,
                          services: prev.services.map(s => 
                            s.id === editingServiceId ? currentService : s
                          )
                        }));
                      } else {
                        // Add new service
                        setFormData(prev => ({
                          ...prev,
                          services: [...prev.services, currentService]
                        }));
                      }

                      setShowServiceModal(false);
                      toast({
                        title: "Service ajouté",
                        description: "Le service a été ajouté à votre demande"
                      });
                    }}
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={!currentService.serviceType}
                  >
                    {editingServiceId ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Contact;