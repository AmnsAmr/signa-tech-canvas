import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import { useImageCache } from '@/hooks/useImageCache';
import ImageLoader from '@/components/ImageLoader';
import { useOptimizedContactSettings } from '@/hooks/useOptimizedContactSettings';
import ContactForm from '@/components/Contact/ContactForm';
import { 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  MessageCircle,
  Heart,
  LucideIcon
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';

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
  vectorFile?: File | null;
}

interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon: Icon, title, value }) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const isEmailCard = useMemo(() => {
    const lowerTitle = title.toLowerCase();
    return lowerTitle.includes('email') || lowerTitle.includes('e-mail');
  }, [title]);
  
  const handleEmailClick = useCallback(() => {
    if (isEmailCard) {
      setShowEmailDialog(true);
    }
  }, [isEmailCard]);
  
  const handleEmailConfirm = useCallback(() => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${value}`, '_blank');
    setShowEmailDialog(false);
  }, [value]);
  
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
                  isEmailCard 
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
  
  const whatsappUrl = useMemo(() => {
    if (!settings.whatsapp) return '';
    const cleanNumber = settings.whatsapp.replace(/[\+\s]/g, '');
    return `https://wa.me/${cleanNumber}`;
  }, [settings.whatsapp]);
  
  const [formData, setFormData] = useState<FormData>({
    name: isAuthenticated ? user?.name || '' : '',
    company: isAuthenticated ? user?.company || '' : '',
    email: isAuthenticated ? user?.email || '' : '',
    phone: isAuthenticated ? user?.phone || '' : '',
    project: '',
    message: '',
    services: [],
    vectorFile: null
  });

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
            <ContactForm formData={formData} setFormData={setFormData} />

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
                  href={whatsappUrl}
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
            <h2 className="text-3xl font-bold text-foreground mb-4">{t('contact.find_us')}</h2>
            <p className="text-muted-foreground">{t('contact.location')}</p>
          </div>
          
          <Card className="overflow-hidden border-0 shadow-strong">
            <div className="aspect-[16/10] relative">
              <iframe
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2505.6213869187595!2d-5.902106889775268!3d35.71167407246298!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b897d4f10addf%3A0x750ef0252561ca92!2sSIGNATECH!5e0!3m2!1sen!2sma!4v1752152038428!5m2!1sen!2sma" 
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Signa Tech Location"
                onError={() => console.error('Map failed to load')}
                onLoad={() => console.log('Map loaded successfully')}
              ></iframe>
              <div className="absolute inset-0 bg-muted/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                <p className="text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded">
                  {t('contact.map_loading') || 'Loading map...'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>



      <Footer />
    </div>
  );
};

export default Contact;