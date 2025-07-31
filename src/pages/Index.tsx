import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useLanguage , yearsOfExperience} from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import { 
  ArrowRight, 
  Award, 
  Users, 
  Clock, 
  Palette, 
  Building, 
  Store, 
  Sparkles,
  CheckCircle,
  Star,
  Quote,
  Zap,
  Play,
  TrendingUp,
  Lightbulb,
  Phone
} from 'lucide-react';
import HomepageTestimonials from '@/components/RatingSystem/HomepageTestimonials';
import { useImageCache } from '@/hooks/useImageCache';
import usePreloadCriticalImages from '@/hooks/usePreloadCriticalImages';
import ImageLoader from '@/components/ImageLoader';
import { useEffect } from 'react';

const Index = () => {
  const { t } = useLanguage();
  const { images: heroImages } = useImageCache('hero');
  const { images: aboutImages } = useImageCache('about');
  
  // Sort hero images by ID to ensure consistent order
  const sortedHeroImages = [...heroImages].sort((a, b) => a.id - b.id);
  
  // Use the sorted hero images for the three cards
  const heroImage = sortedHeroImages[0]; // Main hero image
  const facadeImage = sortedHeroImages[1]; // Facade project image (2nd hero image)
  const plvImage = sortedHeroImages[2]; // PLV project image (3rd hero image)
  
  // Preload critical images for better LCP
  usePreloadCriticalImages(
    [heroImage?.filename, facadeImage?.filename].filter(Boolean),
    { fetchPriority: 'high' }
  );
  
  // Log available images for debugging
  useEffect(() => {
    console.log('Hero images available:', heroImages.length);
    console.log('About images available:', aboutImages.length);
    
    // Log the specific images being used
    console.log('Hero image 1 (main):', heroImage?.filename);
    console.log('Hero image 2 (facade):', facadeImage?.filename);
    console.log('Hero image 3 (plv/craft):', plvImage?.filename);
  }, [heroImages, aboutImages, heroImage, facadeImage, plvImage]);
  
  const services = [
    {
      icon: Palette,
      title: t('services.design.title'),
      description: t('services.design.desc'),
      features: [t('services.design.feature1'), t('services.design.feature2'), t('services.design.feature3')]
    },
    {
      icon: Store,
      title: t('services.retail.title'),
      description: t('services.retail.desc'),
      features: [t('services.retail.feature1'), t('services.retail.feature2'), t('services.retail.feature3')]
    },
    {
      icon: Sparkles,
      title: t('services.seasonal.title'),
      description: t('services.seasonal.desc'),
      features: [t('services.seasonal.feature1'), t('services.seasonal.feature2'), t('services.seasonal.feature3')]
    },
    {
      icon: Building,
      title: t('services.signage.title'),
      description: t('services.signage.desc'),
      features: [t('services.signage.feature1'), t('services.signage.feature2'), t('services.signage.feature3')]
    }
  ];

  // Testimonials are now loaded dynamically from the database

  const stats = [
    { number: yearsOfExperience, label: t('stats.experience'), icon: Clock },
    { number: "500+", label: t('stats.projects'), icon: Award },
    { number: "200+", label: t('stats.clients'), icon: Users },
    { number: "100%", label: t('stats.solutions'), icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead />
      <Header />
      
      {/* Hero Section - Ultra Optimized */}
      <section className="bg-gradient-hero min-h-screen flex items-center justify-center perf-layer">
        <div className="container mx-auto px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="bg-white/20 text-white border border-white/30 mb-6 text-sm px-4 py-2 rounded-full inline-flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('hero.badge')}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              {t('hero.title1')}
              <span className="block text-accent">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
              {t('hero.subtitle')} 
              <span className="font-bold text-accent"> {t('hero.subtitle.highlight')}</span> {t('hero.subtitle.end')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white mobile-transform text-lg px-8 py-4 rounded-xl w-full sm:w-auto"
              >
                <Link to="/contact">
                  <Zap className="mr-2 h-5 w-5" />
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white hover:text-primary mobile-transform text-lg px-8 py-4 rounded-xl w-full sm:w-auto"
              >
                <Link to="/portfolio">
                  <Play className="mr-2 h-5 w-5" />
                  {t('hero.cta.secondary')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimal */}
      <section className="py-12 lg:py-16 bg-gradient-subtle perf-layer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Minimal */}
      <section className="py-12 lg:py-16 perf-layer">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="bg-gradient-primary text-white mb-6 text-sm px-6 py-2 rounded-full inline-flex items-center">
              <Lightbulb className="mr-2 h-4 w-4" />
              {t('services.badge')}
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-foreground mb-6 leading-tight">
              {t('services.title1')}
              <span className="block text-primary">{t('services.title2')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md mobile-transform">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-primary text-white mobile-transform text-lg px-8 py-4 rounded-xl">
              <Link to="/services">
                <TrendingUp className="mr-2 h-5 w-5" />
                {t('services.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Preview - Minimal */}
      <section className="py-12 lg:py-16 perf-layer">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="bg-gradient-primary text-white mb-6 text-sm px-6 py-2 rounded-full inline-flex items-center">
              <Star className="mr-2 h-4 w-4" />
              {t('portfolio.badge')}
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-foreground mb-6 leading-tight">
              {t('portfolio.title1')}
              <span className="block text-primary">{t('portfolio.title2')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('portfolio.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md mobile-transform">
              <div className="aspect-square overflow-hidden">
                <ImageLoader
                  filename={facadeImage?.filename}
                  alt="Habillage façade"
                  className="w-full h-full object-cover"
                  critical={true}
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{t('portfolio.facade.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('portfolio.facade.desc')}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md mobile-transform">
              <div className="aspect-square overflow-hidden">
                <ImageLoader
                  filename={heroImage?.filename}
                  alt="Displays PLV"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{t('portfolio.plv.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('portfolio.plv.desc')}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md mobile-transform">
              <div className="aspect-square overflow-hidden">
                <ImageLoader
                  filename={plvImage?.filename}
                  alt="Artisanat"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">{t('portfolio.craft.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('portfolio.craft.desc')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-primary text-white mobile-transform text-lg px-8 py-4 rounded-xl">
              <Link to="/portfolio">
                <Sparkles className="mr-2 h-5 w-5" />
                {t('portfolio.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials - Minimal */}
      <section className="py-12 lg:py-16 bg-gradient-subtle perf-layer">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="bg-gradient-primary text-white mb-6 text-sm px-6 py-2 rounded-full inline-flex items-center">
              <Users className="mr-2 h-4 w-4" />
              {t('testimonials.badge')}
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-foreground mb-6 leading-tight">
              {t('testimonials.title1')}
              <span className="block text-primary">{t('testimonials.title2')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <HomepageTestimonials />
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="mobile-transform text-lg px-8 py-4 rounded-xl">
              <Link to="/ratings">
                <Star className="mr-2 h-5 w-5" />
                {t('rating.view_all')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-16 lg:py-24 bg-gradient-hero perf-layer">
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6 leading-tight">
              {t('cta.title1')}
              <span className="block text-accent">
                {t('cta.title2')}
              </span>
              <span className="block text-xl lg:text-3xl font-light mt-4">{t('cta.title3')}</span>
            </h2>
            <p className="text-lg lg:text-xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t('cta.subtitle')}<span className="font-bold text-accent">{t('cta.subtitle.highlight')}</span> {t('cta.subtitle.end')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary hover:bg-accent hover:text-white mobile-transform text-lg px-8 py-4 rounded-xl w-full sm:w-auto"
              >
                <Link to="/contact">
                  <Zap className="mr-2 h-5 w-5" />
                  {t('cta.primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white hover:text-primary mobile-transform text-lg px-8 py-4 rounded-xl w-full sm:w-auto"
              >
                <a href="tel:+212539403133">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('cta.secondary')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
