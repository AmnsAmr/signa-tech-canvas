import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
}

const SEOHead = ({ title, description, keywords, path = '' }: SEOHeadProps) => {
  const { language, t } = useLanguage();

  const seoData = {
    fr: {
      title: title || 'Signa Tech - Solutions PLV & Signalétique Créatives au Maroc',
      description: description || 'Signa Tech, expert en PLV et signalétique au Maroc. Création sur mesure de supports visuels, habillage façades, displays retail. 15+ années d\'expérience.',
      keywords: keywords || 'PLV Maroc, signalétique Tanger, displays retail, habillage façade, communication visuelle, Signa Tech'
    },
    en: {
      title: title || 'Signa Tech - Creative POS & Signage Solutions in Morocco',
      description: description || 'Signa Tech, expert in POS and signage in Morocco. Custom creation of visual supports, facade cladding, retail displays. 15+ years of experience.',
      keywords: keywords || 'POS Morocco, signage Tangier, retail displays, facade cladding, visual communication, Signa Tech'
    }
  };

  useEffect(() => {
    const currentSEO = seoData[language];
    
    // Update title
    document.title = currentSEO.title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMeta('description', currentSEO.description);
    updateMeta('keywords', currentSEO.keywords);
    updateMeta('robots', 'index, follow');
    updateMeta('author', 'Signa Tech');
    
    // Open Graph tags
    updateProperty('og:title', currentSEO.title);
    updateProperty('og:description', currentSEO.description);
    updateProperty('og:type', 'website');
    updateProperty('og:locale', language === 'fr' ? 'fr_MA' : 'en_US');
    updateProperty('og:site_name', 'Signa Tech');
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', currentSEO.title);
    updateMeta('twitter:description', currentSEO.description);
    
    // Language and hreflang
    document.documentElement.lang = language;
    
    // Remove existing hreflang links
    const existingHreflang = document.querySelectorAll('link[hreflang]');
    existingHreflang.forEach(link => link.remove());
    
    // Add hreflang links
    const baseUrl = window.location.origin;
    const currentPath = path || window.location.pathname;
    
    const addHreflang = (lang: string, href: string) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    };
    
    addHreflang('fr', `${baseUrl}${currentPath}?lang=fr`);
    addHreflang('en', `${baseUrl}${currentPath}?lang=en`);
    addHreflang('x-default', `${baseUrl}${currentPath}`);
    
  }, [language, title, description, keywords, path]);

  return null;
};

export default SEOHead;