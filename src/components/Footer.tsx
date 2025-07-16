import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOptimizedContactSettings } from '@/hooks/useOptimizedContactSettings';

const Footer = () => {
  const { t, language } = useLanguage();
  const { settings } = useOptimizedContactSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-muted to-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">ST</span>
              </div>
            <div>
              <h3 className="text-xl font-bold text-primary">{settings.company_name}</h3>
              <p className="text-xs text-muted-foreground">{settings.company_tagline}</p>
            </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:shadow-glow transition-all">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:shadow-glow transition-all">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:shadow-glow transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary text-sm transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/portfolio" className="text-muted-foreground hover:text-primary text-sm transition-colors">{t('nav.projects')}</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary text-sm transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">{t('services.design.title')}</li>
              <li className="text-muted-foreground text-sm">{t('services.retail.title')}</li>
              <li className="text-muted-foreground text-sm">{t('services.seasonal.title')}</li>
              <li className="text-muted-foreground text-sm">{t('services.signage.title')}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">{t('footer.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground text-sm">
                  {language === 'fr' ? settings.address_fr : settings.address_en}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-muted-foreground text-sm">{settings.phone}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-muted-foreground text-sm">{settings.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} {settings.company_name}. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/legal" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              {t('footer.legal')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;