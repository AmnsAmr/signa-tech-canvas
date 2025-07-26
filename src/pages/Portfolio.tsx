import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import { useState, useEffect } from 'react';
import { 
  Star, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import ProjectCarousel from '@/components/ProjectCarousel';

interface Project {
  id: number;
  title: string;
  description?: string;
  image_filename?: string;
}

interface ProjectSection {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  projects: Project[];
}

const Portfolio = () => {
  const { t } = useLanguage();
  const [sections, setSections] = useState<ProjectSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectSections();
  }, []);

  const fetchProjectSections = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/projects/sections'));
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Failed to fetch project sections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={t('portfolio.title1') + ' ' + t('portfolio.title2') + ' - Signa Tech'}
        description={t('portfolio.subtitle')}
        path="/portfolio"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-5xl mx-auto">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 mb-8 text-lg px-8 py-3">
              <Star className="mr-2 h-5 w-5" />
              {t('portfolio.badge')}
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
              {t('portfolio.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('portfolio.title2')}
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl leading-relaxed font-light max-w-4xl mx-auto">
              {t('portfolio.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Project Carousels */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-primary rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">Nos Réalisations</h2>
            <p className="text-muted-foreground text-lg">
              {loading ? 'Chargement...' : 'Découvrez notre portfolio organisé par catégories'}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Chargement des projets...</p>
            </div>
          ) : sections.length > 0 ? (
            <div className="space-y-16">
              {sections.map((section) => (
                <ProjectCarousel
                  key={section.id}
                  title={section.name}
                  projects={section.projects}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun projet disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-primary-foreground max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-black mb-8 leading-tight">
              {t('cta.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                {t('cta.title2')}
              </span>
            </h2>
            <p className="text-2xl mb-12 text-white/90 leading-relaxed font-light">
              {t('cta.subtitle')}<span className="font-bold text-accent">{t('cta.subtitle.highlight')}</span> {t('cta.subtitle.end')}
            </p>
            <div className="flex flex-col lg:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white shadow-glow hover:shadow-pink transition-all text-xl px-12 py-6 rounded-2xl transform hover:scale-110"
              >
                <Link to="/contact">
                  <Zap className="mr-3 h-6 w-6" />
                  {t('cta.primary')}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;